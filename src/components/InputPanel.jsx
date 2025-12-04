// src/components/InputPanel.jsx

import { useState, useEffect } from 'react';

const QWERTY_ROWS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
];

const InputPanel = ({ constraints, onChange }) => {
    const { green, yellow, gray } = constraints;

    // Local state for yellow grid (4 rows x 5 positions)
    const [yellowGrid, setYellowGrid] = useState([
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ]);

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
    // HANDLER FOR YELLOW LETTERS
    // ------------------------------------------------------------------
    const handleYellowChange = (e, rowIndex, colIndex) => {
        const value = e.target.value.toUpperCase();

        // Update local grid state
        const newGrid = yellowGrid.map((row, i) =>
            i === rowIndex ? row.map((cell, j) => j === colIndex ? (value.length === 1 ? value : '') : cell) : row
        );
        setYellowGrid(newGrid);

        // Convert grid to yellow object format
        const newYellow = {};
        newGrid.forEach((row) => {
            row.forEach((letter, position) => {
                if (letter) {
                    if (!newYellow[letter]) {
                        newYellow[letter] = [];
                    }
                    if (!newYellow[letter].includes(position)) {
                        newYellow[letter].push(position);
                    }
                }
            });
        });

        const newConstraints = {
            ...constraints,
            yellow: newYellow,
            gray: new Set(Array.from(gray).filter(l => !Object.keys(newYellow).includes(l))),
        };

        onChange(newConstraints);
    };

    // ------------------------------------------------------------------
    // HANDLER FOR GRAY KEYBOARD
    // ------------------------------------------------------------------
    const handleKeyboardClick = (letter) => {
        const newGray = new Set(gray);

        if (newGray.has(letter)) {
            // Toggle off - remove from gray
            newGray.delete(letter);
        } else {
            // Toggle on - add to gray (only if not green or yellow)
            const isGreen = Object.values(green).includes(letter);
            const isYellow = Object.keys(yellow).includes(letter);

            if (!isGreen && !isYellow) {
                newGray.add(letter);
            }
        }

        onChange({
            ...constraints,
            gray: newGray
        });
    };

    // ------------------------------------------------------------------
    // RESET HANDLER
    // ------------------------------------------------------------------
    const handleReset = () => {
        setYellowGrid([
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', '']
        ]);

        onChange({
            green: { '0': '', '1': '', '2': '', '3': '', '4': '' },
            yellow: {},
            gray: new Set(),
        });
    };

    // ------------------------------------------------------------------
    // KEYBOARD BUTTON STYLING
    // ------------------------------------------------------------------
    const getKeyboardClass = (letter) => {
        // Green has highest priority
        if (Object.values(green).includes(letter)) {
            return 'bg-emerald-500 text-slate-900 shadow-lg ring-2 ring-emerald-300';
        }
        // Gray next
        if (gray.has(letter)) {
            return 'bg-slate-700 text-gray-400';
        }
        // Yellow letters shown but not clickable for gray
        if (Object.keys(yellow).includes(letter)) {
            return 'bg-amber-400 text-slate-900 shadow-md cursor-not-allowed';
        }
        // Default
        return 'bg-slate-600 text-white hover:bg-slate-500';
    };

    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------
    return (
        <div className="space-y-6">

            {/* RESET BUTTON */}
            <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
            >
                Clear All Constraints
            </button>

            {/* GREEN LETTERS (Correct Position) */}
            <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Green Letters (Correct Position)</h3>
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
            </div>

            {/* YELLOW LETTERS (In Word, Wrong Position) */}
            <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Yellow Letters (NOT at these positions)</h3>
                <p className="text-xs text-gray-400 mb-2">
                    Enter letters that were yellow at each position
                </p>
                <div className="space-y-1">
                    {yellowGrid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-between space-x-2">
                            {row.map((cell, colIndex) => (
                                <input
                                    key={`${rowIndex}-${colIndex}`}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-10 text-xl text-center font-bold bg-slate-700 rounded border-2 border-amber-400 uppercase focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    value={cell}
                                    onChange={(e) => handleYellowChange(e, rowIndex, colIndex)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* GRAY KEYBOARD (Not in Word) */}
            <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Gray Letters (Not in Word)</h3>
                <p className="text-xs text-gray-400 mb-2">
                    Click to mark letters not in the word
                </p>
                <div className="space-y-1">
                    {QWERTY_ROWS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                            {row.map((letter) => (
                                <button
                                    key={letter}
                                    className={`w-8 h-8 text-sm font-bold rounded transition ${getKeyboardClass(letter)}`}
                                    onClick={() => handleKeyboardClick(letter)}
                                    disabled={Object.values(green).includes(letter) || Object.keys(yellow).includes(letter)}
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
