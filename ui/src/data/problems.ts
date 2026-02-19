import type { FileItem } from '../components/FileExplorer';

export interface ProblemData {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  files: FileItem[];
}

export const problems: Record<string, ProblemData> = {
  '1': {
    id: '1',
    title: 'Build a Counter Component',
    difficulty: 'easy',
    category: 'State Management',
    description: `Build a simple counter component with the following features:
    
1. Display the current count (starting at 0)
2. A button to increment the count by 1
3. A button to decrement the count by 1
4. A button to reset the count to 0

Requirements:
- Use React hooks (useState)
- Add some basic styling
- Make sure the component is named "App"`,
    files: [
      {
        id: 'app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  // TODO: Add your state and logic here
  
  return (
    <div className="counter-container">
      <h1>Counter App</h1>
      {/* Add your counter UI here */}
    </div>
  );
}`,
      },
      {
        id: 'styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.counter-container {
  text-align: center;
  padding: 40px;
  max-width: 400px;
  margin: 0 auto;
}

.counter-display {
  font-size: 3rem;
  font-weight: bold;
  color: #1976d2;
  margin: 20px 0;
}

.counter-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}`,
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Todo List App',
    difficulty: 'medium',
    category: 'Forms & Lists',
    description: `Build a todo list application with the following features:

1. An input field to add new todos
2. Display a list of todos
3. Each todo should have a checkbox to mark it as complete
4. A delete button for each todo
5. Show the count of remaining todos

Requirements:
- Use React hooks (useState)
- Handle form submission
- Style completed todos differently (e.g., strikethrough)
- Component should be named "App"`,
    files: [
      {
        id: 'todo-app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  // TODO: Add your state and logic here
  
  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      {/* Add your todo list UI here */}
    </div>
  );
}`,
      },
      {
        id: 'todo-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.todo-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input {
  flex: 1;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background: white;
}

.todo-item.completed {
  text-decoration: line-through;
  opacity: 0.6;
}`,
      },
    ],
  },
  '3': {
    id: '3',
    title: 'Advanced Search with Debouncing',
    difficulty: 'hard',
    category: 'Performance',
    description: `Build a search component with debouncing:

1. An input field for search
2. Display "Searching..." while debouncing
3. Show search results after 500ms delay
4. Use a mock data array to search from
5. Highlight matching text in results

Requirements:
- Implement debouncing using useEffect and setTimeout
- Clear timeout on component unmount
- Case-insensitive search
- Component should be named "App"

Mock Data: Use an array of fruits or countries to search from.`,
    files: [
      {
        id: 'search-app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  const mockData = [
    'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry',
    'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon'
  ];
  
  // TODO: Add your state and logic here
  
  return (
    <div className="search-container">
      <h1>Search with Debouncing</h1>
      {/* Add your search UI here */}
    </div>
  );
}`,
      },
      {
        id: 'search-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.search-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
}

.search-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 20px;
}

.search-results {
  list-style: none;
}

.search-result-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background: white;
}`,
      },
    ],
  },
  '4': {
    id: '4',
    title: 'Form Validation',
    difficulty: 'medium',
    category: 'Forms & Lists',
    description: `Build a registration form with validation:

1. Fields: Name, Email, Password, Confirm Password
2. Validate each field on blur
3. Show error messages for invalid inputs
4. Disable submit button until form is valid
5. Display success message on valid submission

Validation Rules:
- Name: Required, min 3 characters
- Email: Required, valid email format
- Password: Required, min 8 characters, must contain number
- Confirm Password: Must match password

Component should be named "App"`,
    files: [
      {
        id: 'form-app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  // TODO: Add your state and validation logic here
  
  return (
    <div className="form-container">
      <h1>Registration Form</h1>
      <form>
        {/* Add your form fields here */}
      </form>
    </div>
  );
}`,
      },
      {
        id: 'form-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input.error {
  border-color: #d32f2f;
}

.error-message {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 4px;
}

.success-message {
  color: #2e7d32;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 4px;
  margin-top: 20px;
}`,
      },
    ],
  },
  '5': {
    id: '5',
    title: 'Build a Modal Component',
    difficulty: 'easy',
    category: 'Components',
    description: `Build a reusable modal component:

1. A button that opens the modal
2. Modal should have a backdrop/overlay
3. Modal should have a close button
4. Clicking the backdrop should close the modal
5. ESC key should close the modal

Requirements:
- Use React hooks (useState, useEffect)
- Add smooth open/close animations (optional)
- Modal should be centered on screen
- Component should be named "App"`,
    files: [
      {
        id: 'modal-app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  // TODO: Add your state and logic here
  
  return (
    <div className="modal-demo">
      <h1>Modal Component</h1>
      {/* Add your modal and trigger button here */}
    </div>
  );
}`,
      },
      {
        id: 'modal-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.modal-demo {
  padding: 40px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}`,
      },
    ],
  },
  '6': {
    id: '6',
    title: 'Real-time Collaborative Editor',
    difficulty: 'hard',
    category: 'Advanced',
    description: `Build a collaborative text editor simulation:

1. A textarea for editing
2. Show multiple "user" cursors (simulated)
3. Character count and word count
4. Auto-save indicator (simulate with delay)
5. Undo/Redo functionality (up to 10 steps)

Requirements:
- Use React hooks (useState, useEffect, useRef)
- Implement undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Show save status (Saved/Saving...)
- Simulate other users typing randomly
- Component should be named "App"`,
    files: [
      {
        id: 'editor-app-js',
        name: 'App.jsx',
        type: 'file',
        language: 'javascript',
        content: `function App() {
  // TODO: Add your state and logic here
  
  return (
    <div className="editor-container">
      <h1>Collaborative Editor</h1>
      {/* Add your editor UI here */}
    </div>
  );
}`,
      },
      {
        id: 'editor-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.editor-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-stats {
  font-size: 0.875rem;
  color: #666;
}

.editor-textarea {
  width: 100%;
  min-height: 300px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.save-status {
  margin-top: 10px;
  font-size: 0.875rem;
  color: #666;
}

.save-status.saving {
  color: #ff9800;
}

.save-status.saved {
  color: #4caf50;
}`,
      },
    ],
  },
};

export const getProblemById = (id: string): ProblemData | undefined => {
  return problems[id];
};
