# rerender - React Machine Coding Interview Prep

A complete React coding practice platform with an integrated code editor and live preview engine.

## Features

### 🎯 Interactive Problem Solving
- 6 carefully curated React problems ranging from easy to hard difficulty
- Real-time code execution and preview
- Split-pane interface with resizable panels
- Monaco Editor integration for a professional coding experience

### 🚀 Code Execution Engine
- Live JSX transpilation using Babel
- Sandboxed iframe execution
- Instant error feedback
- Support for React hooks (useState, useEffect, useRef, etc.)

### 📚 Problem Categories
1. **Easy**
   - Build a Counter Component (State Management)
   - Build a Modal Component (Components)

2. **Medium**
   - Todo List App (Forms & Lists)
   - Form Validation (Forms & Lists)

3. **Hard**
   - Advanced Search with Debouncing (Performance)
   - Real-time Collaborative Editor (Advanced)

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **UI Library**: Material-UI (MUI) 7.3.7
- **Code Editor**: Monaco Editor (VS Code's editor)
- **JSX Transpilation**: Babel Standalone
- **Routing**: React Router DOM 7.13.0
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js v20.18.0 or higher
- npm 11.0.0 or higher

### Installation

1. Navigate to the UI directory:
```bash
cd ui
```

2. Install dependencies (already done):
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
ui/
├── src/
│   ├── components/
│   │   └── CodeExecutionEngine.tsx    # Handles code transpilation and execution
│   ├── pages/
│   │   ├── Home.tsx                   # Landing page with problem list
│   │   ├── Login.tsx                  # Login page
│   │   ├── Signup.tsx                 # Signup page
│   │   └── Problem.tsx                # Main coding interface
│   ├── data/
│   │   └── problems.ts                # Problem definitions and starter code
│   ├── types/
│   │   └── babel-standalone.d.ts      # TypeScript declarations
│   ├── App.tsx                        # Main app with routing
│   ├── main.tsx                       # App entry point
│   └── theme.ts                       # MUI theme configuration
└── package.json
```

## How It Works

### Code Execution Flow

1. **User writes code** in the Monaco Editor
2. **Click "Run Code"** button
3. **Babel transpiles** JSX to JavaScript
4. **Code is injected** into a sandboxed iframe with React loaded
5. **Component renders** in the preview pane
6. **Errors are caught** and displayed

### Sandboxed Execution

The code execution engine uses an iframe with:
- React 18 loaded from CDN
- Sandboxed environment for security
- Access to common React hooks
- Clean, isolated execution context

### Adding New Problems

To add a new problem, edit `src/data/problems.ts`:

```typescript
export const problems: Record<string, ProblemData> = {
  '7': {
    id: '7',
    title: 'Your Problem Title',
    difficulty: 'medium',
    category: 'Your Category',
    description: `Problem description with requirements...`,
    starterCode: `function App() {
  // Starter code here
  return <div>Hello</div>;
}`,
  },
};
```

## Features Details

### Monaco Editor Configuration
- Dark theme
- TypeScript/JavaScript syntax highlighting
- Line numbers enabled
- Minimap disabled for more space
- Auto-layout for responsive sizing
- Word wrap enabled

### Split Pane Interface
- Vertical split between editor and preview
- Resizable gutter (drag to resize)
- 50/50 default split
- Minimum size constraints for usability

### Problem Interface
- **Left Panel**: Problem description with requirements
- **Top Bar**: Problem title, difficulty, and category badges
- **Editor Panel**: Code editor with syntax highlighting
- **Preview Panel**: Live output of your React component
- **Action Buttons**: Run Code, Reset to starter code

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Dependencies Installed

### Core
- `@monaco-editor/react` - Monaco Editor wrapper
- `@babel/standalone` - Browser-based JSX transpilation
- `react-split` - Resizable split panes

### UI
- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material-UI icons
- `@emotion/react` & `@emotion/styled` - CSS-in-JS styling

## Browser Support

Modern browsers with ES6+ support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Limitations

1. **External Libraries**: Only React and React hooks are available. Cannot import external npm packages in the code editor.
2. **CSS Styling**: Use inline styles or style tags within the component code.
3. **Async Operations**: Real API calls won't work, use mock data instead.
4. **Performance**: Large code executions may be slower due to browser-based transpilation.

## Future Enhancements

- [ ] User authentication (Google/GitHub OAuth partially integrated)
- [ ] Save code progress to backend
- [ ] Test case validation
- [ ] Code submission and evaluation
- [ ] Leaderboard and performance tracking
- [ ] More problems and categories
- [ ] Support for external libraries
- [ ] Code hints and autocomplete suggestions
- [ ] Solution videos and hints system

## Troubleshooting

### Editor not loading
- Check browser console for errors
- Ensure Monaco Editor loaded correctly
- Clear browser cache and reload

### Code not executing
- Check for compilation errors in the error alert
- Ensure component is named "App"
- Verify you clicked "Run Code" button

### Preview shows errors
- Check browser console (iframe errors)
- Verify JSX syntax is correct
- Ensure all hooks are used properly

## Contributing

To contribute:
1. Add problems to `src/data/problems.ts`
2. Improve the execution engine
3. Add new features or UI improvements
4. Fix bugs and improve performance

## License

MIT License - feel free to use this for learning and practice!

---

Built with ❤️ for React developers preparing for machine coding interviews.
