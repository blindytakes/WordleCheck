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

    // Use Tailwind classes to implement the dark theme layout with cloud motif
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4">
            <h1 className="text-4xl text-center font-bold text-emerald-400 mb-6">
                Wordle Cloud Helper
            </h1>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT PANEL: InputPanel component will go here */}
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-400">Input Constraints</h2>
                    <InputPanel constraints={constraints} onChange={handleConstraintChange} />
                </div>
                
                {/* RIGHT PANEL: WordCloud component will go here */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-xl min-h-[600px] flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                        Possible Answers ({filteredResults.length} remaining)
                    </h2>
                    <WordCloud results={filteredResults} />
                </div>
            </div>
        </div>
    );
}

export default App;