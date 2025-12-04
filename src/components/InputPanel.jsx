// src/components/InputPanel.jsx

import React, { useState } from 'react';

const ALPHABET = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
const KEYBOARD_ROWS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
];

const InputPanel = ({ constraints, onChange }) => {
    const { green, yellow, gray } = constraints;
    const [yellowRows, setYellowRows] = useState([0, 1, 2, 3]);
    const [yellowInputs, setYellowInputs] = useState({});

    // ------------------------------------------------------------------
    // 1. HANDLER FOR GREEN LETTERS (5-Letter Input Grid)
    // ------------------------------------------------------------------
    const handleGreenChange = (e, index) => {
        const value = e.target.value.toUpperCase();
        const position = String(index);

        // Create the updated green constraints object
        const newGreen = {
            ...green,
            [position]: value.length === 1 ? value : '',
        };

        // Create the full new constraints object
        const newConstraints = {
            ...constraints,
            green: newGreen,
            // Optimization: Remove a letter from gray if it's now green.
            gray: new Set(Array.from(gray).filter(l => l !== value)),
        };

        // Update the App's state, triggering the filter
        onChange(newConstraints);

        // Implement Auto-Focus for Green Letters (UX improvement)
        if (value && index < 4) {
            const nextInput = document.querySelector(`input[data-green-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    // ------------------------------------------------------------------
    // 2. HANDLER FOR YELLOW LETTERS (Position Exclusions)
    // ------------------------------------------------------------------
    const handleYellowChange = (e, rowIndex, posIndex) => {
        const value = e.target.value.toUpperCase();
        const key = `${rowIndex}-${posIndex}`;

        // Update local state for visual feedback
        const newYellowInputs = {
            ...yellowInputs,
            [key]: value.length === 1 ? value : ''
        };
        setYellowInputs(newYellowInputs);

        // Build yellow constraints: letter -> [excluded positions]
        const newYellow = { ...yellow };

        // Collect all yellow letters from inputs
        Object.entries(newYellowInputs).forEach(([inputKey, letter]) => {
            if (letter) {
                const [, pos] = inputKey.split('-');
                if (!newYellow[letter]) {
                    newYellow[letter] = [];
                }
                if (!newYellow[letter].includes(parseInt(pos))) {
                    newYellow[letter].push(parseInt(pos));
                }
            }
        });

        const newConstraints = {
            ...constraints,
            yellow: newYellow
        };

        onChange(newConstraints);
    };

    // ------------------------------------------------------------------
    // 3. HANDLER FOR GRAY LETTERS (Keyboard Click)
    // ------------------------------------------------------------------
    const handleGrayLetterClick = (letter) => {
        const newGray = new Set(gray);

        if (newGray.has(letter)) {
            newGray.delete(letter);
        } else {
            newGray.add(letter);
        }

        const newConstraints = {
            ...constraints,
            gray: newGray
        };

        onChange(newConstraints);
    };

    // ------------------------------------------------------------------
    // 4. CLEAR ALL CONSTRAINTS
    // ------------------------------------------------------------------
    const handleClearAll = () => {
        setYellowInputs({});
        onChange({
            green: { '0': '', '1': '', '2': '', '3': '', '4': '' },
            yellow: {},
            gray: new Set()
        });
    };

    // ------------------------------------------------------------------
    // 5. RENDER LOGIC
    // ------------------------------------------------------------------

    const getGreenInputClass = (index) => {
        const hasValue = green[index] && green[index].length > 0;
        return `w-12 h-12 text-2xl text-center font-bold rounded-lg border-2 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 shadow-md ${
            hasValue
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white'
        }`;
    };

    const getYellowInputClass = (value) => {
        const hasValue = value && value.length > 0;
        return `w-12 h-12 text-xl text-center font-bold rounded-lg border-2 uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 shadow-md ${
            hasValue
                ? 'bg-yellow-500 border-yellow-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white'
        }`;
    };

    const getKeyboardButtonClass = (letter) => {
        const isGray = gray.has(letter);
        return `px-3 py-3 rounded-lg font-bold transition-all duration-200 shadow-md ${
            isGray
                ? 'bg-slate-800 text-gray-500 border-2 border-slate-700'
                : 'bg-slate-600 text-white hover:bg-slate-500 border-2 border-slate-500'
        }`;
    };

    return (
        <div className="space-y-6">

            {/* CLEAR ALL BUTTON */}
            <button
                onClick={handleClearAll}
                className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 border-2 border-slate-600"
            >
                Clear All Constraints
            </button>

            {/* 1. GREEN LETTER INPUT GRID (Correct Position) */}
            <div>
                <h3 className="text-md font-semibold text-white mb-3">Green Letters (Correct Position)</h3>

                <div className="flex justify-between gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <input
                            key={index}
                            data-green-index={index}
                            type="text"
                            maxLength="1"
                            className={getGreenInputClass(index)}
                            value={green[index] || ''}
                            onChange={(e) => handleGreenChange(e, index)}
                        />
                    ))}
                </div>
            </div>

            {/* 2. YELLOW LETTERS INPUT (NOT at these positions) */}
            <div>
                <h3 className="text-md font-semibold text-white mb-2">Yellow Letters (NOT at these positions)</h3>
                <p className="text-xs text-gray-400 mb-3">Enter letters that were yellow at each position</p>

                <div className="space-y-2">
                    {yellowRows.map((rowIndex) => (
                        <div key={rowIndex} className="flex justify-between gap-2">
                            {Array.from({ length: 5 }).map((_, posIndex) => {
                                const key = `${rowIndex}-${posIndex}`;
                                const value = yellowInputs[key] || '';
                                return (
                                    <input
                                        key={key}
                                        type="text"
                                        maxLength="1"
                                        className={getYellowInputClass(value)}
                                        value={value}
                                        onChange={(e) => handleYellowChange(e, rowIndex, posIndex)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. GRAY LETTERS KEYBOARD (Not in Word) */}
            <div>
                <h3 className="text-md font-semibold text-white mb-2">Gray Letters (Not in Word)</h3>
                <p className="text-xs text-gray-400 mb-3">Click to mark letters not in the word</p>

                <div className="space-y-2">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                            {row.map((letter) => (
                                <button
                                    key={letter}
                                    className={getKeyboardButtonClass(letter)}
                                    onClick={() => handleGrayLetterClick(letter)}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InputPanel;