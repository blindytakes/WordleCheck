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
            gray: new Set(gray),
            yellow: { ...yellow },
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
        // If the letter is currently DEFAULT
        else {
            // State transition: DEFAULT -> YELLOW (add to yellow with empty exclusions)
            newConstraints.yellow[letter] = [];
        }

        // Final cleanup: If a letter is marked green, it cannot be yellow or gray
        const isGreen = Object.values(green).includes(letter);
        if (isGreen) {
            newConstraints.gray.delete(letter);
            delete newConstraints.yellow[letter];
        }

        onChange(newConstraints);
    };

    // ------------------------------------------------------------------
    // 3. HANDLER FOR YELLOW POSITION TOGGLES
    // ------------------------------------------------------------------
    const handleYellowPositionToggle = (letter, position) => {
        const currentExclusions = yellow[letter] || [];
        let newExclusions;

        if (currentExclusions.includes(position)) {
            // Remove this position from exclusions
            newExclusions = currentExclusions.filter(p => p !== position);
        } else {
            // Add this position to exclusions
            newExclusions = [...currentExclusions, position];
        }

        onChange({
            ...constraints,
            yellow: {
                ...yellow,
                [letter]: newExclusions
            }
        });
    };

    // ------------------------------------------------------------------
    // 3. RENDER LOGIC
    // ------------------------------------------------------------------

    const getButtonClass = (letter) => {
        // 1. Check Green (Priority 1: Green takes visual priority)
        if (Object.values(green).includes(letter)) {
            return 'bg-emerald-500 text-slate-900 shadow-lg border-2 border-emerald-300 ring-2 ring-emerald-400';
        }
        // 2. Check Gray (Priority 2) - Much more obvious
        if (gray.has(letter)) {
            return 'bg-slate-950 text-gray-500 border-2 border-slate-700 line-through';
        }
        // 3. Check Yellow (Priority 3) - Very visible
        if (Object.keys(yellow).includes(letter)) {
            return 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg border-2 border-amber-300 ring-2 ring-amber-400';
        }
        // 4. Default State
        return 'bg-slate-600 text-white hover:bg-slate-500 border-2 border-slate-500';
    };

    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------
    return (
        <div className="space-y-6">

            {/* 1. GREEN LETTER INPUT GRID (Correct Position) */}
            <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-3">Green Letters (Correct Position)</h3>
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

            {/* Divider */}
            <div className="border-t border-slate-700"></div>

            {/* 2. YELLOW LETTERS (In Word, Wrong Position) */}
            <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-3">
                    Yellow Letters (In Word, Wrong Position)
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                    Click position numbers to mark where you tried each letter
                </p>
                <div className="space-y-3">
                    {Object.keys(yellow).length > 0 ? (
                        Object.keys(yellow).map((letter) => (
                            <div key={letter} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded">
                                {/* Letter badge */}
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-amber-500 text-slate-900 font-bold rounded flex items-center justify-center text-xl shadow-lg">
                                        {letter}
                                    </div>
                                    <button
                                        onClick={() => handleAlphabetClick(letter)}
                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                    >
                                        Remove
                                    </button>
                                </div>

                                {/* Position toggles */}
                                <div className="flex gap-1">
                                    {[0, 1, 2, 3, 4].map((pos) => {
                                        const isExcluded = yellow[letter].includes(pos);
                                        return (
                                            <button
                                                key={pos}
                                                onClick={() => handleYellowPositionToggle(letter, pos)}
                                                className={`w-8 h-8 rounded font-bold text-sm transition ${
                                                    isExcluded
                                                        ? 'bg-slate-900 text-amber-400 border-2 border-amber-500 line-through'
                                                        : 'bg-slate-600 text-white hover:bg-slate-500 border-2 border-slate-500'
                                                }`}
                                                title={isExcluded ? `Not in position ${pos + 1}` : `Click if tried position ${pos + 1}`}
                                            >
                                                {pos + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm italic">Click letters below to mark as yellow</p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700"></div>

            {/* 3. QWERTY KEYBOARD (Click to Toggle) */}
            <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Keyboard (Click to Toggle State)</h3>
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
        </div>
    );
};

export default InputPanel;
