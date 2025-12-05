# WordleViz 🎯

**A powerful, interactive Wordle helper that visualizes possible solutions based on your game constraints.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://wordle-check.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Styled with Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)

## 🌟 Features

### Core Functionality
- **Green Letters (Correct Position)**: Click individual cells to mark letters in their correct positions
- **Yellow Letters (Wrong Position)**: Add multiple letters per position that appear elsewhere in the word
- **Gray Letters (Absent)**: Track letters that don't appear in the solution
- **Smart Validation**: Prevents adding green/yellow letters to the gray list
- **Real-time Filtering**: Instantly see matching words from 2,309 official Wordle solutions

### User Experience
- **Interactive Word Cloud**: Displays up to 40 matching words with dynamic sizing and animations
- **Keyboard Status Display**: Visual keyboard showing which letters are green, yellow, or gray
- **Cell Navigation**: Arrow keys to move between positions, Tab to cycle between rows
- **Undo Support**: Ctrl+Z (Cmd+Z on Mac) to undo recent actions (20-state history)
- **Clear All**: ESC shortcut or button to reset all constraints
- **Word Count**: Shows "Showing X of Y words" to track filtered results
- **Position Labels**: Numbered 1-5 labels above constraint rows for clarity

### Visual Design
- **Modern Gradients**: Beautiful purple-pink-orange color scheme throughout
- **Smooth Animations**: Page load animations, staggered word entry with spring physics
- **Interactive Feedback**: Hover effects, scale transitions, colored shadows
- **Polished UI**: Rounded corners, depth shadows, gradient buttons and text
- **Light/Dark Theme**: Toggle between themes (dark mode support included)

## 🚀 Live Demo

**Visit the live app:** [wordle-check.vercel.app](https://wordle-check.vercel.app)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Animation library
- **Context API** - Global state management
- **Vercel** - Deployment and hosting

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup
```bash
# Clone the repository
git clone https://github.com/blindytakes/WordleCheck.git
cd WordleCheck

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 🎮 How to Use

### Basic Workflow
1. **Play Wordle** and note your results for each guess
2. **Add Green Letters**: Click the green row, select a position (1-5), type the correct letter
3. **Add Yellow Letters**: Click the yellow row, select a position, type letters that appear elsewhere
4. **Add Gray Letters**: Click the gray row, type letters that don't appear in the word
5. **View Results**: The word cloud updates instantly with matching possibilities

### Keyboard Shortcuts
- **Tab**: Cycle between Green → Yellow → Gray rows
- **Arrow Keys**: Navigate between positions within a row
- **Backspace**: Remove the last letter in the current cell/row
- **ESC**: Clear all constraints and start over
- **Ctrl+Z / Cmd+Z**: Undo the last action (up to 20 steps)

### Example Usage
If your Wordle guess shows:
- **S** is green in position 1
- **T** is yellow in position 2 (appears elsewhere)
- **A, R, E** are gray (not in the word)

1. Click Green row → Position 1 → Type **S**
2. Click Yellow row → Position 2 → Type **T**
3. Click Gray row → Type **A**, **R**, **E**
4. See all matching words in the cloud (e.g., STICK, STUMP, STOCK)

## 🏗️ Project Structure

```
WordleCheck/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Title, word count, theme toggle
│   │   ├── GreenRow.jsx         # Correct position letters
│   │   ├── YellowRow.jsx        # Wrong position letters
│   │   ├── GrayRow.jsx          # Absent letters
│   │   ├── Keyboard.jsx         # Visual keyboard status
│   │   ├── WordCloud.jsx        # Filtered word display
│   │   └── ErrorMessage.jsx     # Validation error display
│   ├── context/
│   │   └── ConstraintContext.jsx # Global state management
│   ├── utils/
│   │   ├── filterLogic.js       # Word filtering algorithm
│   │   └── wordList.js          # 2,309 Wordle solutions
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## 🧪 Key Features Explained

### Word Filtering Logic
The app uses precise filtering rules that match Wordle's behavior:
- **Green**: Letter must be in exact position
- **Yellow**: Letter must appear in word but NOT in the specified position
- **Gray**: Letter must not appear anywhere in the word
- Handles edge cases like duplicate letters correctly

### State Management
Uses React Context API for global state with:
- Green letter positions (0-4)
- Yellow letter arrays per position
- Gray letter set
- Filtered word list
- 20-state undo history

### Performance Optimizations
- `useMemo` for expensive word filtering
- `useCallback` for stable function references
- Efficient re-renders with proper dependency arrays
- AnimatePresence for smooth list transitions

## 🎨 Customization

### Changing the Word List
Edit `src/utils/wordList.js` to use a different word list. Current list contains 2,309 official Wordle solutions.

### Adjusting Display Count
In `WordCloud.jsx`, change the display limit (default: 40):
```javascript
const displayCount = Math.min(filteredWords.length, 40); // Change 40 to your limit
```

### Modifying Theme Colors
Edit `src/index.css` or component classNames to customize the gradient color scheme.

## 🐛 Known Issues

- Dark mode word cloud text visibility needs improvement (fix in progress)

## 🚀 Deployment

The app is configured for zero-config deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Vercel auto-detects Vite settings
4. Deploy!

Every push to `main` triggers automatic redeployment.

## 📝 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgments

- Official Wordle word list
- Tailwind CSS for styling system
- Framer Motion for animations
- Vercel for hosting

## 📧 Contact

Built by [blindytakes](https://github.com/blindytakes)

---

**Enjoy solving your Wordle puzzles faster!** 🎯✨
