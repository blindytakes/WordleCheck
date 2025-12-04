// src/components/WordCloud.jsx

import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

// ------------------------------------------------------------------
// 1. SCORING LOGIC (Likelihood Calculation)
//    - This is a placeholder for basic scoring.
//    - You can enhance this later with letter frequency analysis.
// ------------------------------------------------------------------

const commonLetters = 'EAROTISLNC'.split('');

const scoreWord = (word) => {
    let score = 0;
    // Base score by counting common letters (E, A, R, O, T, etc.)
    for (const letter of word) {
        if (commonLetters.includes(letter)) {
            score += 1;
        }
    }
    // A simple heuristic for word likelihood
    return score + 1;
};

// ------------------------------------------------------------------
// 2. WORD CLOUD COMPONENT
// ------------------------------------------------------------------

const WordCloud = ({ results }) => {
    const svgRef = useRef(null);

    // Prepare data (only runs when results change)
    const words = useMemo(() => {
        return results.map(word => ({
            text: word,
            score: scoreWord(word),
        }));
    }, [results]);

    // Define D3 Scales for size and color
    const maxScore = d3.max(words, d => d.score) || 1;
    const minScore = d3.min(words, d => d.score) || 1;

    // Adjust font size based on number of words for better cloud appearance
    const numWords = words.length;
    const maxSize = numWords > 500 ? 48 : numWords > 100 ? 56 : 64;
    const minSize = numWords > 500 ? 12 : numWords > 100 ? 14 : 16;

    const sizeScale = d3.scaleLinear().domain([minScore, maxScore]).range([minSize, maxSize]);

    // Color scale: Maps score to a Cyan/Emerald/Blue color palette
    const colorScale = d3.scaleLinear()
        .domain([minScore, maxScore])
        .range(["#06b6d4", "#10b981"]) // Cyan to Emerald
        .interpolate(d3.interpolateHsl);


    // D3 rendering logic inside a useEffect for canvas updates
    useEffect(() => {
        const width = svgRef.current.clientWidth;
        const height = 600; // Fixed height for visualization area

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        // Clear previous cloud
        svg.selectAll("g").remove();

        // Group element for transitions and placement
        const group = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        if (words.length === 0) return;

        // D3-Cloud Layout Configuration
        const layout = cloud()
            .size([width, height])
            .words(words)
            .padding(5) // Increased padding for better spacing
            .rotate(() => (Math.random() > 0.85 ? 90 : 0)) // 15% vertical rotation for variety
            .font("Impact, sans-serif")
            .fontSize(d => sizeScale(d.score)) // Apply size scale
            .spiral("archimedean") // Use archimedean spiral for more circular cloud shape
            .on("end", draw); // Call draw function once layout is complete

        layout.start();

        // Drawing function called by d3-cloud
        function draw(cloudWords) {
            const wordElements = group.selectAll("text")
                .data(cloudWords, d => d.text);

            // EXIT: Remove words that are no longer in the filtered list
            wordElements.exit()
                .transition().duration(500)
                .style("opacity", 0)
                .remove();

            // ENTER + UPDATE: Add new words and update existing ones
            const allWords = wordElements.enter().append("text")
                // Start new words invisible for fade-in animation
                .style("opacity", 0)
                .style("cursor", "pointer")
                .merge(wordElements);

            // Add click handler (must be done before transition)
            allWords
                .on("click", (event, d) => {
                    navigator.clipboard.writeText(d.text);
                    // Minimal feedback (could be a toast notification later)
                    alert(`Copied: ${d.text}`);
                });

            // Apply transition animations
            allWords
                .transition().duration(750) // Smooth animation duration
                .style("font-size", d => `${d.size}px`)
                .style("fill", d => colorScale(d.score))
                .style("font-family", "Impact, sans-serif")
                .style("font-weight", "bold")
                .style("opacity", 1) // Fade in
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
                .text(d => d.text.toUpperCase()); // Display in uppercase for better visibility
        }

    }, [words, sizeScale, colorScale]); // Re-run effect when filtered words change

    return (
        <div className="w-full h-full">
             {/* The SVG element must fill its parent container */}
            <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
    );
};

export default WordCloud;
