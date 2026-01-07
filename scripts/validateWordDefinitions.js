#!/usr/bin/env node
/**
 * Wordle Solutions Validator
 * - Validates words against Free Dictionary API, with Wiktionary fallback
 * - Checkpoints progress to allow resume
 * - Atomic writes to avoid corrupting outputs
 * - Retries with timeout + 429 handling (Retry-After seconds or date) + backoff w/ jitter
 * - Adds global cooldown after 429 (+buffer) and slower default pacing to reduce repeated 429s
 * - Produces clean logs when piping output (e.g., tee) vs interactive TTY progress updates
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Paths ---
const SOLUTIONS_PATH = path.join(__dirname, "../src/data/solutions.js");
const BACKUP_PATH = path.join(__dirname, "../src/data/solutions.js.backup");
const PROGRESS_PATH = path.join(__dirname, "../src/data/validation-progress.json");
const INVALID_LOG_PATH = path.join(__dirname, "../src/data/invalid-words.json");

// --- Configuration ---
const REQUEST_DELAY_MS = 800; // slower per-word pacing to reduce 429s (was 150)
const FALLBACK_DELAY_MS = 400; // extra delay before hitting Wiktionary fallback
const BATCH_SAVE_INTERVAL = 25;

const REQUEST_TIMEOUT_MS = 10_000; // 10s per request
const MAX_RETRIES = 3;

// Backoff (for 429 or transient network failures)
const BASE_BACKOFF_MS = 1_500;
const MAX_BACKOFF_MS = 60_000;

// Extra global cooldown buffer after any 429 (in addition to Retry-After/backoff)
const RATE_LIMIT_BUFFER_MS = 2_000;

// User-Agent: some endpoints behave better with one.
// Set WORD_VALIDATOR_CONTACT="mailto:you@example.com" (or similar) in your env.
const CONTACT = process.env.WORD_VALIDATOR_CONTACT || "";
const USER_AGENT = CONTACT ? `WordleValidator/1.0 (${CONTACT})` : "WordleValidator/1.0";

// --- Utilities ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function jitter(ms) {
  // +/- 25% jitter
  const delta = ms * 0.25;
  return Math.max(0, Math.round(ms + (Math.random() * 2 - 1) * delta));
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Atomic write: write tmp then rename (best-effort atomic on same filesystem)
 */
function writeAtomic(targetPath, content) {
  const tmp = `${targetPath}.tmp`;
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, targetPath);
}

/**
 * Parse Retry-After:
 * - integer seconds
 * - HTTP-date
 */
function parseRetryAfterMs(headerValue) {
  if (!headerValue) return null;

  // seconds
  const seconds = Number.parseInt(headerValue, 10);
  if (Number.isFinite(seconds)) return seconds * 1000;

  // HTTP-date
  const asDate = Date.parse(headerValue);
  if (!Number.isNaN(asDate)) {
    const delta = asDate - Date.now();
    return delta > 0 ? delta : 0;
  }

  return null;
}

/**
 * Determine if error is likely transient and worth retrying
 */
function isTransientNetworkError(err) {
  if (!err) return false;
  if (err.name === "AbortError") return true;

  // Node fetch errors often have a cause with a code (e.g., ECONNRESET, ENOTFOUND)
  const code = err.code || err?.cause?.code;
  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "UND_ERR_CONNECT_TIMEOUT" || // undici style
    code === "UND_ERR_SOCKET" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT"
  );
}

/**
 * Fetch with retries:
 * - Timeout via AbortController
 * - 429: honor Retry-After if present; otherwise exponential backoff
 * - Adds RATE_LIMIT_BUFFER_MS to any 429 wait to avoid immediate re-429 loops
 * - Transient network errors: exponential backoff with jitter
 *
 * Semantics: retries = number of retries AFTER the first attempt
 * Total attempts = retries + 1
 */
async function fetchWithRetry(url, word, { retries = MAX_RETRIES } = {}) {
  let attempt = 0;

  while (true) {
    attempt += 1;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });

      // 429 Rate limit handling
      if (res.status === 429) {
        // If this was the last allowed attempt, return the 429 response.
        if (attempt >= retries + 1) return res;

        const ra = parseRetryAfterMs(res.headers.get("Retry-After"));
        const baseWait =
          ra ??
          jitter(clamp(BASE_BACKOFF_MS * 2 ** (attempt - 1), BASE_BACKOFF_MS, MAX_BACKOFF_MS));

        const waitMs = baseWait + RATE_LIMIT_BUFFER_MS;

        console.warn(
          `\n⚠️ 429 Rate limited on "${word}". Attempt ${attempt}/${retries + 1}. ` +
            `Waiting ${Math.round(waitMs / 1000)}s...`
        );

        await sleep(waitMs);
        continue;
      }

      return res;
    } catch (err) {
      // Retry only on transient errors, and only if we still have attempts remaining.
      const canRetry = isTransientNetworkError(err) && attempt < retries + 1;

      if (!canRetry) {
        throw err;
      }

      const backoff = jitter(clamp(BASE_BACKOFF_MS * 2 ** (attempt - 1), BASE_BACKOFF_MS, MAX_BACKOFF_MS));

      console.warn(
        `\n📡 Transient error on "${word}" (attempt ${attempt}/${retries + 1}): ${err?.message || err}. ` +
          `Retrying in ${Math.round(backoff / 1000)}s...`
      );

      await sleep(backoff);
      continue;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Validation logic: returns { valid: boolean, source?: string }
 */
async function validateWord(word) {
  const w = word.toLowerCase().trim();

  // Enforce Wordle shape (adjust if your list isn't strictly 5-letter)
  if (w.length !== 5) return { valid: false, source: "length" };

  // 1) Free Dictionary
  try {
    const r1 = await fetchWithRetry(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
      w
    );

    if (r1.ok) {
      const data = await r1.json();
      if (data?.[0]?.meanings?.length > 0) return { valid: true, source: "FreeDictionary" };
    }
  } catch {
    // swallow; fall through to wiktionary
  }

  // Small delay before fallback to reduce burstiness
  await sleep(FALLBACK_DELAY_MS);

  // 2) Wiktionary fallback
  try {
    const r2 = await fetchWithRetry(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w)}`,
      w
    );

    if (r2.ok) {
      const data = await r2.json();
      if (data?.en?.length > 0) return { valid: true, source: "Wiktionary" };
    }
  } catch {
    // swallow
  }

  return { valid: false };
}

/**
 * Load SOLUTIONS_LIST from solutions.js with guard.
 * Note: still regex-based; for maximum robustness use AST parsing.
 */
function loadSolutionsFromFile(rawContent) {
  const match = rawContent.match(/export const SOLUTIONS_LIST\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!match) {
    throw new Error(
      `CRITICAL: Could not find SOLUTIONS_LIST export in ${SOLUTIONS_PATH}. Check formatting.`
    );
  }

  // Parse words (simple list of quoted strings).
  // This assumes entries are just quoted strings separated by commas.
  const allWords = match[1]
    .split(",")
    .map((w) => w.trim().replace(/['"]/g, ""))
    .filter(Boolean);

  return { allWords };
}

/**
 * Load progress state
 * - results keyed by word to avoid duplicate append on resume
 */
function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    return { lastIndex: 0, results: {}, meta: { createdAt: new Date().toISOString() } };
  }
  console.log("🔄 Resuming from previous session...");
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
}

function printProgressLine(line) {
  // When piping to tee (non-TTY), avoid \r carriage return artifacts
  if (process.stdout.isTTY) {
    process.stdout.write(line + "\r");
  } else {
    console.log(line);
  }
}

/**
 * Main Execution
 */
async function run() {
  // 1) Read + parse
  const rawContent = fs.readFileSync(SOLUTIONS_PATH, "utf8");
  const { allWords } = loadSolutionsFromFile(rawContent);

  // Only process clean 5-letter alpha words (prevents odd tokens from being rewritten unexpectedly)

  const wordsToProcess = allWords
   .map((w) => w.trim())
   .filter((w) => w.length === 5);
  

  // 2) Backup + progress
  const state = loadProgress();

  if (state.lastIndex === 0 && !fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(SOLUTIONS_PATH, BACKUP_PATH);
    console.log("📦 Backup created.");
  }

  console.log(`🚀 Processing ${wordsToProcess.length} words starting at index ${state.lastIndex}...`);

  // 3) Validate loop
  for (let i = state.lastIndex; i < wordsToProcess.length; i++) {
    const word = wordsToProcess[i];
    const { valid, source } = await validateWord(word);

    // keyed by word prevents duplicates across resume
    state.results[word] = valid;
    state.lastIndex = i + 1;

    const line = `${valid ? "✅" : "❌"} [${state.lastIndex}/${wordsToProcess.length}] ${word}${
      valid ? ` (${source})` : ""
    }`;
    printProgressLine(line);

    // pacing
    await sleep(REQUEST_DELAY_MS);

    // checkpoint
    if (state.lastIndex % BATCH_SAVE_INTERVAL === 0 || state.lastIndex === wordsToProcess.length) {
      writeAtomic(PROGRESS_PATH, JSON.stringify(state, null, 2));
    }
  }

  // 4) Compile outputs deterministically
  const validWords = wordsToProcess.filter((w) => state.results[w] === true);
  const invalidWords = wordsToProcess.filter((w) => state.results[w] === false);

  // 5) Rewrite solutions export + update a specific comment line if present
  const finalContent = rawContent
    .replace(
      /export const SOLUTIONS_LIST\s*=\s*\[[\s\S]*?\]\s*;/,
      `export const SOLUTIONS_LIST = [\n  ${validWords.map((w) => `"${w.toLowerCase()}"`).join(",\n  ")}\n];`
    )
    .replace(/\/\/\s*Total:\s*\d+\s*words/g, `// Total: ${validWords.length} words`);

  writeAtomic(SOLUTIONS_PATH, finalContent);
  writeAtomic(INVALID_LOG_PATH, JSON.stringify(invalidWords, null, 2));

  // cleanup
  if (fs.existsSync(PROGRESS_PATH)) fs.unlinkSync(PROGRESS_PATH);

  // Ensure the final line doesn't get overwritten in TTY mode
  if (process.stdout.isTTY) process.stdout.write("\n");

  console.log(`\n🎉 Done! Kept: ${validWords.length} | Removed: ${invalidWords.length}`);
  console.log(`📝 Invalid words written to: ${INVALID_LOG_PATH}`);
}

run().catch((err) => {
  console.error("\n💥 Fatal Error:", err?.stack || err?.message || err);
  process.exit(1);
});
