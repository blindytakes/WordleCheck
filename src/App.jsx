// src/App.jsx

import { useState, useMemo } from 'react';
import { SOLUTIONS_LIST } from './data/solutions';
import { filterWordList } from './utils/filterlogic';
// Update the CSS import to point to index.css where Tailwind is active
import './index.css'; 

// Temporary Placeholders (We will create these components next)
import InputPanel from './components/InputPanel';
import WordCloud from './components/WordCloudComponent';

// Initial state for constraints
const initialConstraints = {
    green: { '0': '', '1': '', '2': '', '3': '', '4': '' }, 
    yellow: {}, 
    gray: new Set(), 
};

function App() {
    // 1. STATE MANAGEMENT
    const [constraints, setConstraints] = useState(initialConstraints);

    // 2. CORE LOGIC: Recalculates the filtered word list ONLY when constraints change
    const filteredResults = useMemo(() => {
        const results = filterWordList(constraints, SOLUTIONS_LIST);
        
        console.log(`Words remaining: ${results.length}`);
        
        return results;
    }, [constraints]);

    // Function to update constraints (passed down to the InputPanel)
    const handleConstraintChange = (newConstraints) => {
        setConstraints(newConstraints);
    };

    // Use Tailwind classes to implement the dark theme layout
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center">
            <h1 className="text-5xl text-center font-bold text-emerald-400 mb-8 mt-4">
                ☁️ Wordle Cloud Helper ☁️
            </h1>

            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT PANEL: Input Constraints */}
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-400">Input Constraints</h2>
                    <InputPanel constraints={constraints} onChange={handleConstraintChange} />
                </div>

                {/* RIGHT PANEL: Word Cloud Visualization */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-xl relative overflow-hidden">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                        Possible Answers ({filteredResults.length} remaining)
                    </h2>
                    <div className="w-full h-[600px] relative z-10">
                        <WordCloud results={filteredResults} />
                    </div>
                    {/* Decorative Cloud Background */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20">
                        <svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 120L0 16.4C28.5 18.9 57 21.5 97 21.5C137 21.5 188.5 18.9 240 21.5C291.5 24.2 343 32 394.5 36.5C446 41 497.5 42.2 549 40.5C600.5 38.8 652 34.2 703.5 32C755 29.8 806.5 30 858 31.5C909.5 33 961 35.8 1012.5 39.5C1064 43.2 1115.5 47.8 1141.2 50.2L1167 52.5L1167 120L1141.2 120C1115.5 120 1064 120 1012.5 120C961 120 909.5 120 858 120C806.5 120 755 120 703.5 120C652 120 600.5 120 549 120C497.5 120 446 120 394.5 120C343 120 291.5 120 240 120C188.5 120 137 120 97 120C57 120 28.5 120 14.2 120L0 120Z"
                                  fill="#06b6d4" opacity="0.5"/>
                            <path d="M0 120L0 56C48.3 53.8 96.7 51.7 145 53.8C193.3 56 241.7 62.5 290 63.8C338.3 65.2 386.7 61.5 435 59.8C483.3 58.2 531.7 58.7 580 61.5C628.3 64.3 676.7 69.5 725 70.8C773.3 72.2 821.7 69.8 870 69.2C918.3 68.5 966.7 69.5 1015 72.8C1063.3 76.2 1111.7 81.8 1135.8 84.7L1160 87.5L1160 120L1135.8 120C1111.7 120 1063.3 120 1015 120C966.7 120 918.3 120 870 120C821.7 120 773.3 120 725 120C676.7 120 628.3 120 580 120C531.7 120 483.3 120 435 120C386.7 120 338.3 120 290 120C241.7 120 193.3 120 145 120C96.7 120 48.3 120 24.2 120L0 120Z"
                                  fill="#10b981" opacity="0.3"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;