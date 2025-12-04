// src/utils/filterLogic.js

/**
 * Filters the master word list against the user-defined constraints.
 * @param {Object} constraints - The user's input constraints (green, yellow, gray).
 * @param {string[]} solutionsList - The master list of 5-letter Wordle answers.
 * @returns {string[]} An array of valid remaining words.
 */
export function filterWordList(constraints, solutionsList) {
    const { green, yellow, gray } = constraints;

    // Convert keys to string for efficient lookup within the loop
    const greenLetters = Object.values(green).filter(l => l !== '');
    const requiredYellowLetters = Object.keys(yellow);

    const filteredWords = solutionsList.filter(word => {
        let isValid = true;
        // Normalize word to uppercase for comparison with constraints
        const wordUpper = word.toUpperCase();

        // 1. --- GREEN (Correct Position) CHECK ---
        for (let i = 0; i < 5; i++) {
            const requiredLetter = green[i];
            if (requiredLetter && wordUpper[i] !== requiredLetter) {
                isValid = false;
                break;
            }
        }
        if (!isValid) return false;

        // 2. --- GRAY (Not In Word) CHECK ---
        // Exclude gray letters, UNLESS they are also green (i.e., multiple instances of a letter).
        for (const letter of gray) {
            if (!greenLetters.includes(letter) && wordUpper.includes(letter)) {
                isValid = false;
                break;
            }
        }
        if (!isValid) return false;

        // 3. --- YELLOW (In Word, Wrong Spot) CHECK ---
        for (const letter of requiredYellowLetters) {

            // Condition A: PRESENCE - The word MUST contain the yellow letter.
            if (!wordUpper.includes(letter)) {
                isValid = false;
                break;
            }

            // Condition B: EXCLUSION - The word MUST NOT have the yellow letter
            // in any of the excluded positions (where it was already guessed).
            for (const position of yellow[letter]) {
                if (wordUpper[position] === letter) {
                    isValid = false;
                    break;
                }
            }
            // If invalid from inner loop, exit outer loop
            if (!isValid) break;
        }

        return isValid;
    });

    return filteredWords;
}