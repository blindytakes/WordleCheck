// src/utils/filterLogic.js

/**
 * Filters the master word list against the user-defined constraints.
 * @param {Object} constraints - The user's input constraints (green, yellow, gray).
 * @param {string[]} solutionsList - The master list of 5-letter Wordle answers.
 * @returns {string[]} An array of valid remaining words.
 */
export function filterWordList(constraints, solutionsList) {
    const { green, yellow, gray } = constraints;

    // Get all green letters (for gray letter checking)
    const greenLetters = Object.values(green).filter(l => l !== null && l !== '');

    // Get all unique yellow letters across all positions
    const allYellowLetters = new Set();
    Object.values(yellow).forEach(arr => {
        arr.forEach(letter => allYellowLetters.add(letter));
    });

    const filteredWords = solutionsList.filter(word => {
        // Normalize word to uppercase for comparison with constraints
        const wordUpper = word.toUpperCase();

        // 1. --- GREEN (Correct Position) CHECK ---
        // Must contain all green letters in their exact positions
        for (let i = 0; i < 5; i++) {
            const requiredLetter = green[i];
            if (requiredLetter && wordUpper[i] !== requiredLetter) {
                return false;
            }
        }

        // 2. --- YELLOW (In Word, Wrong Spot) CHECK ---
        // Must contain all yellow letters
        for (const letter of allYellowLetters) {
            if (!wordUpper.includes(letter)) {
                return false;
            }
        }

        // Must NOT have yellow letters in their marked wrong positions
        for (let position = 0; position < 5; position++) {
            const excludedLetters = yellow[position];
            if (excludedLetters && excludedLetters.length > 0) {
                for (const letter of excludedLetters) {
                    if (wordUpper[position] === letter) {
                        return false;
                    }
                }
            }
        }

        // 3. --- GRAY (Not In Word) CHECK ---
        // Must NOT contain any gray letters (unless they're also green or yellow)
        for (const letter of gray) {
            const isInGreen = greenLetters.includes(letter);
            const isInYellow = allYellowLetters.has(letter);
            if (!isInGreen && !isInYellow && wordUpper.includes(letter)) {
                return false;
            }
        }

        return true;
    });

    return filteredWords;
}