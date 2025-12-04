// src/components/InputPanel.jsx

import React from 'react';

// QWERTY keyboard layout
const KEYBOARD_ROWS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
];

const InputPanel = ({ constraints, onChange }) => {
    const { green, yellow, gray } = constraints;

    // ------------------------------------------------------------------
    // HANDLER FOR GREEN LETTERS
    // ------------------------------------------------------------------
    const handleGreenChange = (e, index) => {
        const value = e.target.value.toUpperCase();
        const position = String(index);

        const newGreen = {
            ...green,
            [position]: value.length === 1 ? value : '',
        };

        const newConstraints = {
            ...constraints,
            green: newGreen,
            gray: new Set(Array.from(gray).filter(l => l !== value)),
        };

        onChange(newConstraints);

        // Auto-focus next box
        if (value && index < 4) {
            const nextInput = document.querySelector(`input[data-green-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    // ------------------------------------------------------------------
    // 2. HANDLER FOR ALPHABET (Yellow/Gray Click Toggle)
    // ------------------------------------------------------------------
    const handleAlphabetClick = (letter) => {
        let newConstraints = {
            ...constraints,
            gray: new Set(gray), // Ensure we're working with a new Set instance
            yellow: { ...yellow }, // Ensure we're working with a new object
        };

        // If the letter is currently GRAY (not in word)
        if (newConstraints.gray.has(letter)) {
            // State transition: GRAY -> DEFAULT (remove from gray)
            newConstraints.gray.delete(letter);
        } 
        
        // If the letter is currently YELLOW (in word, wrong position)
        else if (newConstraints.yellow[letter]) {
            // State transition: YELLOW -> GRAY (remove from yellow, add to gray)
            delete newConstraints.yellow[letter];
            newConstraints.gray.add(letter);
        } 
        
        // If the letter is currently DEFAULT (or Green, but green takes priority visually)
        else {
            // State transition: DEFAULT -> YELLOW (add to yellow)
            // Note: For now, we add it to yellow with an empty list of excluded positions.
            // A more advanced feature would let the user click positions to exclude them.
            newConstraints.yellow[letter] = [];
        }

        // Final cleanup: If a letter is marked green, it cannot be yellow or gray.
        const isGreen = Object.values(green).includes(letter);
        if (isGreen) {
            newConstraints.gray.delete(letter);
            delete newConstraints.yellow[letter];
        }

        // Update the App's state
        onChange(newConstraints);
    };

    // ------------------------------------------------------------------
    // 3. RENDER LOGIC
    // ------------------------------------------------------------------

    const getButtonClass = (letter) => {
        // 1. Check Green (Priority 1: Green takes visual priority)
        if (Object.values(green).includes(letter)) {
            return 'bg-emerald-500 text-slate-900 shadow-lg'; 
        } 
        // 2. Check Gray (Priority 2)
        if (gray.has(letter)) {
            return 'bg-slate-700 text-gray-400 hover:bg-slate-600'; 
        } 
        // 3. Check Yellow (Priority 3)
        if (Object.keys(yellow).includes(letter)) {
            return 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg';
        } 
        // 4. Default State
        return 'bg-slate-600 text-white hover:bg-slate-500'; 
    };

    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------
    return (
        <div className="space-y-8">
            
            {/* 1. GREEN LETTER INPUT GRID (Correct Position) */}
            <h3 className="text-lg font-semibold text-cyan-400">Green Letters (Correct Position)</h3>
            
            <div className="flex justify-between space-x-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <input
                        key={index}
                        data-green-index={index}
                        type="text"
                        maxLength="1"
                        className="w-12 h-12 text-2xl text-center font-bold bg-slate-700 rounded border-2 border-emerald-500 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={green[index] || ''}
                        onChange={(e) => handleGreenChange(e, index)}
                    />
                ))}
            </div>

            {/* 2. QWERTY KEYBOARD (Yellow/Gray) */}
            <h3 className="text-lg font-semibold text-cyan-400 mt-8">Other Letters (Click to Toggle)</h3>

            <div className="space-y-2">
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex justify-center gap-1"
                        style={{ paddingLeft: rowIndex === 1 ? '1.5rem' : rowIndex === 2 ? '3rem' : '0' }}
                    >
                        {row.map((letter) => (
                            <button
                                key={letter}
                                className={`px-3 py-2 min-w-[2.5rem] rounded font-bold transition duration-150 ease-in-out ${getButtonClass(letter)}`}
                                onClick={() => handleAlphabetClick(letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InputPanel;
