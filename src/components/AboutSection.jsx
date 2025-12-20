/**
 * ABOUT SECTION COMPONENT
 *
 * SEO-friendly description of what makes Wordle Cloud unique.
 * Hidden from UI (content now shown in HelpModal) but kept in DOM for search engines.
 * Uses visually-hidden technique: content is in HTML but not displayed.
 */

export default function AboutSection() {
  return (
    <section className="sr-only" aria-hidden="true">
      <h1>Wordle Cloud - Visual Word Filtering Tool</h1>

      <p>
        Wordle Cloud helps you visualize every possible word in real-time as you filter
        by your Wordle clues.
      </p>

      <h2>How to Use Wordle Cloud</h2>

      <h3>Enter Your Letters</h3>
      <p>
        Type green letters (correct position) in the green row, yellow letters (in the word
        but wrong position) in the yellow row, and gray letters (not in the word) in the
        gray row.
      </p>

      <h3>Watch the Cloud Update</h3>
      <p>
        As you enter letters, the word cloud instantly filters to show only valid
        possibilities, making it easy to spot patterns and find your answer.
      </p>

      <h3>View Word Definitions</h3>
      <p>
        Click on any word in the cloud to see its definition. This helps you make more
        strategic guesses and learn new words.
      </p>

      <p>
        Pro tip: The word cloud shows more common words in larger text, helping you
        prioritize likely solutions.
      </p>
    </section>
  );
}
