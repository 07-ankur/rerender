import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Drawer,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Extension as ExtensionIcon,
  OpenInNew as OpenInNewIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  NoteAdd as NoteAddIcon,
  CreateNewFolder as CreateNewFolderIcon,
} from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import CodeExecutionEngine from "../components/CodeExecutionEngine";
import FileExplorer from "../components/FileExplorer";
import type { FileExplorerHandle } from "../components/FileExplorer";
import EditorTabs from "../components/EditorTabs";
import DependencyManager, {
  POPULAR_DEPENDENCIES,
} from "../components/DependencyManager";
import type { Dependency } from "../components/DependencyManager";
import SettingsManager from "../components/SettingsManager";
import Breadcrumb from "../components/Breadcrumb";
import { SiPreact } from "react-icons/si";
import { getProblemById } from "../data/problems";
import type { FileItem } from "../components/FileExplorer";

// Build a path-based map of all files under a folder (relative to that folder)
function buildFilePathMap(
  items: FileItem[],
  basePath: string,
  contents: Record<string, string>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) {
    const p = basePath ? `${basePath}/${item.name}` : item.name;
    if (item.type === "file") map[p] = contents[item.id] ?? item.content;
    if (item.children)
      Object.assign(map, buildFilePathMap(item.children, p, contents));
  }
  return map;
}

// Collect every file path under a folder tree
function getAllFilePaths(items: FileItem[], basePath: string): string[] {
  const paths: string[] = [];
  for (const item of items) {
    const p = basePath ? `${basePath}/${item.name}` : item.name;
    if (item.type === "file") paths.push(p);
    if (item.children) paths.push(...getAllFilePaths(item.children, p));
  }
  return paths;
}

export default function Problem() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();

  const problem = getProblemById(problemId || "1");

  // State management
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [fileStructure, setFileStructure] = useState<FileItem[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    [],
  );
  const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [depSectionOpen, setDepSectionOpen] = useState(true);
  const [depSearch, setDepSearch] = useState("");
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editorPreferences, setEditorPreferences] = useState({
    wordWrap: true,
    lineNumbers: true,
    minimap: false,
    autoSave: false,
  });

  // FileExplorer ref for triggering create dialogs
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // Debouncing references
  const debouncedUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingChangesRef = useRef<Record<string, string>>({});
  const fileStructureRef = useRef<FileItem[]>([]);
  const completionRegisteredRef = useRef(false);

  // Initialize files and content when problem loads
  useEffect(() => {
    if (!problem) {
      navigate("/");
      return;
    }

    // Create default project structure with src and public folders
    const defaultStructure: FileItem[] = [
      {
        id: "public",
        name: "public",
        type: "folder",
        content: "",
        children: [
          {
            id: "public-index",
            name: "index.html",
            type: "file",
            language: "javascript",
            content:
              '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App</title>\n    <style>\n      * {\n        margin: 0;\n        padding: 0;\n        box-sizing: border-box;\n      }\n      \n      body {\n        font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif;\n        -webkit-font-smoothing: antialiased;\n        -moz-osx-font-smoothing: grayscale;\n        background-color: #0a0a0a;\n        color: #ffffff;\n      }\n      \n      #root {\n        width: 100%;\n        min-height: 100vh;\n      }\n    </style>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>',
          },
        ],
      },
      {
        id: "src",
        name: "src",
        type: "folder",
        content: "",
        children: [
          ...problem.files,
          {
            id: "src-index",
            name: "index.jsx",
            type: "file",
            language: "javascript",
            content:
              'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);',
          },
        ],
      },
    ];

    setFileStructure(defaultStructure);

    // Initialize file contents from all files in structure
    const contents: Record<string, string> = {};
    const extractContents = (items: FileItem[]) => {
      items.forEach((item) => {
        if (item.type === "file") {
          contents[item.id] = item.content;
        }
        if (item.children) {
          extractContents(item.children);
        }
      });
    };
    extractContents(defaultStructure);
    setFileContents(contents);

    // Open the first problem file by default
    if (problem.files.length > 0) {
      setOpenFiles([problem.files[0]]);
      setActiveFileId(problem.files[0].id);
    }
  }, [problem, navigate]);

  if (!problem) {
    return null;
  }

  // Get current file being edited
  const currentFile = openFiles.find((f) => f.id === activeFileId);
  const currentLanguage = currentFile?.language || "javascript";

  // Extract JSX and CSS files for preview
  const jsFile = openFiles.find((f) => f.language === "javascript");
  const cssFile = openFiles.find((f) => f.language === "css");
  const componentCode = jsFile ? fileContents[jsFile.id] || "" : "";
  const cssCode = cssFile ? fileContents[cssFile.id] || "" : "";

  // Build path-based file map for module resolution in the preview
  fileStructureRef.current = fileStructure;
  const srcFolder = fileStructure.find((f) => f.id === "src");
  const filePathMap: Record<string, string> = srcFolder?.children
    ? buildFilePathMap(srcFolder.children, "", fileContents)
    : {};

  // Handle file selection from FileExplorer
  const handleFileSelect = (fileId: string) => {
    const file = findItemInStructure(fileStructure, fileId);
    if (!file || file.type !== "file") return;

    // Check if file is already open
    if (!openFiles.find((f) => f.id === fileId)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFileId(fileId);
  };

  // Handle file tab close
  const handleCloseFile = (fileId: string) => {
    const newOpenFiles = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(newOpenFiles);

    // If closed file was active, switch to another
    if (activeFileId === fileId && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[0].id);
    } else if (newOpenFiles.length === 0) {
      setActiveFileId("");
    }
  };

  // Handle file tab selection
  const handleSelectTab = (fileId: string) => {
    setActiveFileId(fileId);
  };

  // Handle code change in editor – debounce state updates so the preview
  // doesn't re-render on every keystroke.  The editor is *uncontrolled*
  // (defaultValue) so cursor position is never disturbed.
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (activeFileId && value !== undefined) {
        pendingChangesRef.current[activeFileId] = value;

        if (debouncedUpdateRef.current)
          clearTimeout(debouncedUpdateRef.current);
        debouncedUpdateRef.current = setTimeout(() => {
          if (Object.keys(pendingChangesRef.current).length > 0) {
            setFileContents((prev) => ({
              ...prev,
              ...pendingChangesRef.current,
            }));
            pendingChangesRef.current = {};
          }
        }, 300);
      }
    },
    [activeFileId],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdateRef.current) clearTimeout(debouncedUpdateRef.current);
    };
  }, []);

  // Flush pending changes when switching files so nothing is lost
  useEffect(() => {
    if (Object.keys(pendingChangesRef.current).length > 0) {
      setFileContents((prev) => ({ ...prev, ...pendingChangesRef.current }));
      pendingChangesRef.current = {};
    }
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
      debouncedUpdateRef.current = null;
    }
  }, [activeFileId]);

  // Monaco beforeMount – register import-path completion provider once
  const handleEditorWillMount = useCallback((monaco: any) => {
    if (completionRegisteredRef.current) return;
    completionRegisteredRef.current = true;

    monaco.languages.registerCompletionItemProvider("javascript", {
      triggerCharacters: ['"', "'", "/", "."],
      provideCompletionItems: (model: any, position: any) => {
        const line = model.getLineContent(position.lineNumber);
        const textBefore = line.substring(0, position.column - 1);

        const fromMatch = textBefore.match(/from\s+['"]([^'"]*?)$/);
        const directImport = textBefore.match(/^\s*import\s+['"]([^'"]*?)$/);
        if (!fromMatch && !directImport) return { suggestions: [] };

        const partial = fromMatch?.[1] ?? directImport?.[1] ?? "";
        const src = fileStructureRef.current.find(
          (f: FileItem) => f.id === "src",
        );
        const allPaths = src?.children ? getAllFilePaths(src.children, "") : [];

        const suggestions = allPaths
          .filter((p: string) => /\.(jsx?|tsx?|css)$/.test(p))
          .map((fp: string) => {
            let importPath = "./" + fp;
            if (/\.(jsx?|tsx?)$/.test(fp))
              importPath = "./" + fp.replace(/\.(jsx?|tsx?)$/, "");
            return {
              label: importPath,
              kind: monaco.languages.CompletionItemKind.File,
              insertText: importPath,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column - partial.length,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              detail: fp,
            };
          });

        ["react", "react-dom"].forEach((mod) =>
          suggestions.push({
            label: mod,
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: mod,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - partial.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            detail: `${mod} library`,
          }),
        );

        return { suggestions };
      },
    });
  }, []);

  const previewWindowRef = useRef<Window | null>(null);

  // Handle message requests from preview window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "PREVIEW_REQUEST_CODE") {
        const jsFile = openFiles.find((f) => f.language === "javascript");
        const cssFile = openFiles.find((f) => f.language === "css");
        const componentCode = jsFile
          ? pendingChangesRef.current[jsFile.id] ||
            fileContents[jsFile.id] ||
            ""
          : "";
        const cssCode = cssFile
          ? pendingChangesRef.current[cssFile.id] ||
            fileContents[cssFile.id] ||
            ""
          : "";

        // Helper function to convert import statements
        const convertImports = (code: string): string => {
          return code
            .split("\n")
            .map((line) => {
              if (line.trim().startsWith("import ") && line.includes("from")) {
                return "";
              }
              if (line.trim().startsWith("export ")) {
                return line.replace(/^export\s+(default\s+)?/, "");
              }
              return line;
            })
            .filter((line) => line !== "")
            .join("\n");
        };

        // Send code back to preview window
        if (previewWindowRef.current && !previewWindowRef.current.closed) {
          previewWindowRef.current.postMessage(
            {
              type: "PREVIEW_CODE_UPDATE",
              js: convertImports(componentCode),
              css: cssCode,
            },
            "*",
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fileContents, openFiles]);

  // Handle open preview in new tab
  const handleOpenPreviewInNewTab = () => {
    // Create HTML content that communicates via postMessage
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rerender Preview</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              padding: 20px;
              background-color: #ffffff;
              color: #000000;
            }
            #root {
              width: 100%;
            }
            button {
              padding: 8px 16px;
              margin: 4px;
              border-radius: 4px;
              border: 1px solid #ddd;
              background-color: #1976d2;
              color: white;
              cursor: pointer;
              font-size: 14px;
              font-family: inherit;
            }
            button:hover {
              background-color: #1565c0;
            }
            input, textarea {
              padding: 8px;
              margin: 4px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
              font-family: inherit;
            }
          </style>
          <style id="dynamic-styles"></style>
        </head>
        <body>
          <div id="root"></div>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
          <script>
            const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef } = React;
            let root = null;
            let lastCode = '';
            let lastCss = '';
            
            function renderPreview(jsCode, cssCode) {
              try {
                // Update CSS
                const styleEl = document.getElementById('dynamic-styles');
                if (styleEl) {
                  styleEl.textContent = cssCode || '';
                }
                
                // Transpile code
                const transpiledCode = Babel.transform(jsCode, {
                  presets: ['react'],
                  filename: 'App.jsx'
                }).code;
                
                // Execute code
                eval(transpiledCode);
                
                // Initialize root if needed
                if (!root) {
                  root = ReactDOM.createRoot(document.getElementById('root'));
                }
                
                // Render component
                if (typeof App !== 'undefined') {
                  root.render(React.createElement(App));
                } else {
                  root.render(React.createElement('div', null, 'No App component found'));
                }
              } catch (error) {
                console.error('Error rendering preview:', error);
                if (!root) {
                  root = ReactDOM.createRoot(document.getElementById('root'));
                }
                root.render(
                  React.createElement('div', { style: { padding: '20px', color: '#d32f2f', fontFamily: 'monospace' } },
                    React.createElement('h2', null, 'Error rendering preview'),
                    React.createElement('p', null, error.message),
                    React.createElement('pre', { style: { marginTop: '10px', overflow: 'auto', fontSize: '12px' } }, error.stack)
                  )
                );
              }
            }
            
            // Request code from parent window
            function requestCode() {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'PREVIEW_REQUEST_CODE' }, '*');
              }
            }
            
            // Listen for code updates from parent window
            window.addEventListener('message', (event) => {
              if (event.data.type === 'PREVIEW_CODE_UPDATE') {
                const { js, css } = event.data;
                
                // Only re-render if code changed
                if (js !== lastCode || css !== lastCss) {
                  console.log('Rendering preview with updated code');
                  renderPreview(js, css);
                  lastCode = js;
                  lastCss = css;
                }
              }
            });
            
            // Request initial code
            requestCode();
            
            // Request code updates every 300ms
            const updateInterval = setInterval(() => {
              requestCode();
            }, 300);
            
            // Cleanup on window close
            window.addEventListener('beforeunload', () => {
              clearInterval(updateInterval);
            });
          </script>
        </body>
      </html>
    `;

    // Create blob and open in new tab
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    previewWindowRef.current = newWindow;
  };

  // Handle run code
  const handleRunCode = () => {
    // Preview updates automatically via CodeExecutionEngine dependencies
    // This is here for explicit run button if needed
  };

  // Handle reset code
  const handleReset = () => {
    setResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    const newContents: Record<string, string> = {};
    problem.files.forEach((file) => {
      newContents[file.id] = file.content;
    });
    setFileContents(newContents);
    setResetConfirmOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+S / Cmd+S - Save File
      if (cmdCtrl && e.key === 's') {
        e.preventDefault();
        // Save functionality - currently files auto-save
      }

      // Ctrl+Shift+P - Toggle Preview
      if (cmdCtrl && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setPreviewCollapsed(!previewCollapsed);
      }

      // Ctrl+Shift+R - Reset Code
      if (cmdCtrl && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setResetConfirmOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCollapsed]);

  // Generate unique ID
  const generateId = () => {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to find item in structure
  const findItemInStructure = (
    items: FileItem[],
    id: string,
  ): FileItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemInStructure(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Helper function to update structure recursively
  const updateStructureRecursive = (
    items: FileItem[],
    parentId: string,
    callback: (items: FileItem[]) => FileItem[],
  ): FileItem[] => {
    if (parentId === "") {
      return callback(items);
    }

    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: callback(item.children || []),
        };
      }
      if (item.children) {
        return {
          ...item,
          children: updateStructureRecursive(item.children, parentId, callback),
        };
      }
      return item;
    });
  };

  // Handle create file
  const handleCreateFile = (
    parentId: string,
    name: string,
    language: "javascript" | "css" = "javascript",
  ) => {
    const newFileId = generateId();
    const newFile: FileItem = {
      id: newFileId,
      name,
      type: "file",
      language,
      content: `// ${name}\n`,
    };

    const updatedStructure = updateStructureRecursive(
      fileStructure,
      parentId,
      (items) => [...items, newFile],
    );

    setFileStructure(updatedStructure);
    setFileContents({
      ...fileContents,
      [newFileId]: newFile.content,
    });

    // Open the new file
    const parentItem =
      parentId === "" ? null : findItemInStructure(fileStructure, parentId);
    if (!parentItem || parentItem.type === "folder") {
      setOpenFiles([...openFiles, newFile]);
      setActiveFileId(newFileId);
    }
  };

  // Handle create folder
  const handleCreateFolder = (parentId: string, name: string) => {
    const newFolderId = generateId();
    const newFolder: FileItem = {
      id: newFolderId,
      name,
      type: "folder",
      content: "",
      children: [],
    };

    const updatedStructure = updateStructureRecursive(
      fileStructure,
      parentId,
      (items) => [...items, newFolder],
    );

    setFileStructure(updatedStructure);
  };

  // Handle delete item
  const CRITICAL_FILES = ['src-index', 'public-index']; // IDs of files that should not be deleted
  
  const handleDeleteItem = (itemId: string) => {
    // Protect critical files
    if (CRITICAL_FILES.includes(itemId)) {
      alert('Cannot delete critical project files (index.jsx and index.html)');
      return;
    }

    // Remove from structure
    const removeFromStructure = (items: FileItem[]): FileItem[] => {
      return items.filter((item) => {
        if (item.id === itemId) {
          return false;
        }
        if (item.children) {
          item.children = removeFromStructure(item.children);
        }
        return true;
      });
    };

    const updatedStructure = removeFromStructure(fileStructure);
    setFileStructure(updatedStructure);

    // Close the file if it's open
    if (activeFileId === itemId) {
      const remainingFiles = openFiles.filter((f) => f.id !== itemId);
      setOpenFiles(remainingFiles);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      } else {
        setActiveFileId("");
      }
    } else {
      setOpenFiles(openFiles.filter((f) => f.id !== itemId));
    }

    // Clean up file contents
    const newContents = { ...fileContents };
    delete newContents[itemId];
    setFileContents(newContents);
  };

  // Handle copy item
  const handleCopyItem = (itemId: string) => {
    const findItemInStructure = (items: FileItem[], id: string): FileItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItemInStructure(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const itemToCopy = findItemInStructure(fileStructure, itemId);
    if (!itemToCopy) return;

    // Generate a unique name for the copy
    const nameParts = itemToCopy.name.split('.');
    const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : itemToCopy.name;
    const extension = nameParts.length > 1 ? '.' + nameParts[nameParts.length - 1] : '';
    let newName = `${baseName}_copy${extension}`;
    let counter = 1;

    // Check if name already exists and increment counter
    const nameExists = (items: FileItem[], name: string): boolean => {
      for (const item of items) {
        if (item.name === name) return true;
        if (item.children && nameExists(item.children, name)) return true;
      }
      return false;
    };

    while (nameExists(fileStructure, newName)) {
      newName = `${baseName}_copy${counter}${extension}`;
      counter++;
    }

    // Create a copy of the item (for non-folder items)
    if (itemToCopy.type === 'file') {
      const copyItem: FileItem = {
        ...itemToCopy,
        id: `${itemToCopy.id}_copy_${Date.now()}`,
        name: newName,
      };

      // Add to the root or same parent
      setFileStructure([...fileStructure, copyItem]);
      
      // Copy the file content
      setFileContents({
        ...fileContents,
        [copyItem.id]: fileContents[itemToCopy.id] || itemToCopy.content,
      });
    }
  };

  // Handle rename item
  const handleRenameItem = (itemId: string, newName: string) => {
    const renameInStructure = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, name: newName };
        }
        if (item.children) {
          return { ...item, children: renameInStructure(item.children) };
        }
        return item;
      });
    };

    setFileStructure(renameInStructure(fileStructure));
  };

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        bgcolor: "#1e1e1e",
      }}
    >
      {/* Top Bar */}
      <AppBar
        position="static"
        sx={{
          zIndex: 1300,
          boxShadow: "none",
          bgcolor: "#0B0B12",
          borderBottom: "1px solid rgba(155, 92, 255, 0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important" }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box onClick={() => setDrawerOpen(!drawerOpen)} sx={{display:'flex', cursor:'pointer', alignItems:'center'}}>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 0, fontSize: "1rem", mr: 2 }}
            >
              {problem.title}
            </Typography>
            <DescriptionIcon
              sx={{ fontSize: "1.35rem", mr: 1, color: "white" }}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunCode}
              size="small"
              sx={{ ml: 2 }}
            >
              Run
            </Button>
            <Tooltip title="Reset">
              <IconButton
                onClick={handleReset}
                size="small"
                sx={{
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(79, 209, 255, 0.1)",
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: "1.3rem" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Left Sidebar - File Explorer & Dependencies (Collapsible) */}
        {!explorerCollapsed && (
          <Box
            sx={{
              width: "280px",
              borderRight: "1px solid rgba(160, 160, 176, 0.1)",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(10, 10, 15, 0.5)",
              backdropFilter: "blur(10px)",
              color: "#a0a0b0",
              overflow: "hidden",
            }}
          >
            {/* Rerender Logo */}
            <Box
              sx={{
                p: 1,
                pl: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: "1px solid rgba(160, 160, 176, 0.08)",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #4FD1FF 0%, #9B5CFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontSize: "1.2rem",
                }}
              >
                <SiPreact color="#ffffff" />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "#F5F5F7",
                  letterSpacing: "0.5px",
                }}
              >
                RERENDER
              </Typography>
            </Box>
            {/* Explorer Header */}
            <Box
              sx={{
                p: 1,
                pl: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "rgba(15, 15, 25, 0.4)",
                borderBottom: "1px solid rgba(160, 160, 176, 0.08)",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                <IconButton
                  size="small"
                  sx={{ p: 0.3, ml: -0.3 }}
                  onClick={() => setExplorerCollapsed(true)}
                  title="Collapse Explorer"
                >
                  <MenuIcon sx={{ fontSize: "0.9rem", color: "#a0a0b0" }} />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#a0a0b0",
                  }}
                >
                  EXPLORER
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: "2px" }}>
                <Tooltip title="New File">
                  <IconButton
                    size="small"
                    onClick={() => fileExplorerRef.current?.triggerCreateFile()}
                    sx={{
                      p: 0.4,
                      color: "#858585",
                      "&:hover": {
                        color: "#e8e8e8",
                        bgcolor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <NoteAddIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="New Folder">
                  <IconButton
                    size="small"
                    onClick={() =>
                      fileExplorerRef.current?.triggerCreateFolder()
                    }
                    sx={{
                      p: 0.4,
                      color: "#858585",
                      "&:hover": {
                        color: "#e8e8e8",
                        bgcolor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <CreateNewFolderIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* File Tree */}
            <Box
              sx={{
                overflowY: "auto",
                flexGrow: 1,
                px: 1.5,
                py: 1,
                backgroundColor: "rgba(5, 1, 10, 0.3)",
              }}
            >
              <FileExplorer
                ref={fileExplorerRef}
                files={fileStructure}
                activeFileId={activeFileId}
                onSelectFile={handleFileSelect}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteItem={handleDeleteItem}
                onCopyItem={handleCopyItem}
                onRenameItem={handleRenameItem}
                hideHeader
              />
            </Box>

            {/* Dependencies Section (CodeSandbox style) */}
            <Box
              sx={{
                borderTop: "1px solid rgba(160, 160, 176, 0.08)",
                bgcolor: "rgba(10, 10, 15, 0.5)",
                maxHeight: depSectionOpen ? "45%" : "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 1,
                  pl: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  bgcolor: "rgba(15, 15, 25, 0.4)",
                  borderBottom: "1px solid rgba(160, 160, 176, 0.08)",
                  "&:hover": {
                    bgcolor: "rgba(79, 209, 255, 0.03)",
                    "& .MuiSvgIcon-root": { color: "#F5F5F7" },
                    "& .MuiTypography-root": { color: "#F5F5F7" },
                  },
                }}
                onClick={() => setDepSectionOpen(!depSectionOpen)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <ExtensionIcon
                    sx={{
                      fontSize: "1.3rem",
                      color: "#a0a0b0",
                      marginRight: "4px",
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#a0a0b0",
                    }}
                  >
                    DEPENDENCIES
                  </Typography>
                </Box>
                <Tooltip title="Manage Dependencies">
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDependencyDialogOpen(true);
                    }}
                  >
                    <AddIcon sx={{ fontSize: "0.9rem", color: "#bbb" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {depSectionOpen && (
                <Box
                  sx={{
                    overflowY: "auto",
                    flex: 1,
                    px: 1,
                    pb: 1,
                  }}
                >
                  {/* Search */}
                  <Box
                    sx={{
                      px: 0.5,
                      py: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "rgba(79, 209, 255, 0.08)",
                        border: "1px solid rgba(79, 209, 255, 0.15)",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.25,
                        transition: "all 300ms ease",
                        "&:focus-within": {
                          bgcolor: "rgba(79, 209, 255, 0.12)",
                          borderColor: "#4FD1FF",
                          boxShadow: "0 0 12px rgba(79, 209, 255, 0.15)",
                        },
                      }}
                    >
                      <SearchIcon
                        sx={{ fontSize: "0.85rem", color: "#4FD1FF", mr: 0.5 }}
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={depSearch}
                        onChange={(e) => setDepSearch(e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#F5F5F7",
                          fontSize: "0.8rem",
                          width: "100%",
                          padding: "3px 0",
                          fontFamily: "inherit",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Installed deps */}
                  {selectedDependencies.length === 0 ? (
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#888",
                        textAlign: "center",
                        py: 1.5,
                      }}
                    >
                      No dependencies added
                    </Typography>
                  ) : (
                    selectedDependencies
                      .filter((d) =>
                        d.toLowerCase().includes(depSearch.toLowerCase()),
                      )
                      .map((dep) => {
                        const info = POPULAR_DEPENDENCIES.find(
                          (d: Dependency) => d.name === dep,
                        );
                        return (
                          <Box
                            key={dep}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 1,
                              py: 0.5,
                              borderRadius: "3px",
                              "&:hover": { bgcolor: "#2a2d2e" },
                              "& .MuiIconButton-root": {
                                opacity: 0,
                                transition: "opacity 0.15s",
                              },
                              "&:hover .MuiIconButton-root": { opacity: 1 },
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: "#e0e0e0",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {dep}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  color: "#888",
                                }}
                              >
                                {info ? `^${info.version}` : ""}
                              </Typography>
                              <IconButton
                                size="small"
                                sx={{
                                  p: 0.25,
                                }}
                                onClick={() =>
                                  setSelectedDependencies(
                                    selectedDependencies.filter(
                                      (d) => d !== dep,
                                    ),
                                  )
                                }
                              >
                                <DeleteIcon
                                  sx={{ fontSize: "0.8rem", color: "#999" }}
                                />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })
                  )}
                </Box>
              )}

              {/* Settings Button */}
              <Box
                sx={{
                  borderTop: "1px solid rgba(160, 160, 176, 0.08)",
                  p: 1,
                  pl: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  bgcolor: "rgba(15, 15, 25, 0.4)",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(79, 209, 255, 0.03)",
                    "& .MuiSvgIcon-root": { color: "#F5F5F7" },
                    "& .MuiTypography-root": { color: "#F5F5F7" },
                  },
                }}
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon
                  sx={{
                    fontSize: "1.4rem",
                    color: "#a0a0b0",
                    marginRight: "4px",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#a0a0b0",
                  }}
                >
                  Settings
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Collapsed Explorer - Show only toggle buttons */}
        {explorerCollapsed && (
          <Box
            sx={{
              width: "48px",
              borderRight: "1px solid rgba(160, 160, 176, 0.1)",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(10, 10, 15, 0.5)",
              backdropFilter: "blur(10px)",
              color: "#a0a0b0",
              overflow: "hidden",
              alignItems: "center",
              py: 1,
              gap: 1,
            }}
          >
            {/* Rerender Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 1,
                borderBottom: "1px solid rgba(160, 160, 176, 0.08)",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #4FD1FF 0%, #9B5CFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontSize: "1.2rem",
                }}
              >
                <SiPreact color="#ffffff" />
              </Box>
            </Box>
            <Tooltip title="Expand Explorer" placement="right">
              <IconButton
                size="small"
                sx={{ p: 0.5, color: "#a0a0b0" }}
                onClick={() => setExplorerCollapsed(false)}
              >
                <MenuIcon sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Manage Dependencies" placement="right">
              <IconButton
                size="small"
                sx={{ p: 0.5, color: "#a0a0b0" }}
                onClick={() => setDependencyDialogOpen(true)}
              >
                <ExtensionIcon sx={{ fontSize: "1.4rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings" placement="right">
              <IconButton
                size="small"
                sx={{ p: 0.5, color: "#a0a0b0" }}
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon sx={{ fontSize: "1.4rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Main Editor Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Editor Tabs */}
          {openFiles.length > 0 && (
            <EditorTabs
              openFiles={openFiles}
              activeFileId={activeFileId}
              onSelectFile={handleSelectTab}
              onCloseFile={handleCloseFile}
            />
          )}

          {/* Editor and Preview area with draggable divider */}
          {!previewCollapsed ? (
            <Split
              sizes={[50, 50]}
              minSize={200}
              expandToMin={false}
              gutterSize={6}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              style={{
                display: "flex",
                flexGrow: 1,
                overflow: "hidden",
                width: "100%",
              }}
              onDragEnd={() => {}}
            >
              {/* Editor Section - Breadcrumb + Editor */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  bgcolor: "#0f0f1a",
                }}
              >
                {/* Breadcrumb Navigation */}
                <Box
                  sx={{
                    height: "40px",
                    display: "flex",
                    borderBottom: "1px solid rgba(160, 160, 176, 0.1)",
                    flexShrink: 0,
                    overflow: "hidden",
                    alignItems: "center",
                    bgcolor: "rgba(10, 10, 15, 0.5)",
                  }}
                >
                  {activeFileId &&
                    (() => {
                      const buildBreadcrumbPaths = () => {
                        const file = findItemInStructure(
                          fileStructure,
                          activeFileId,
                        );
                        if (!file) return [];

                        const findPath = (
                          items: FileItem[],
                          path: string[],
                        ): string[] | null => {
                          for (const item of items) {
                            if (item.id === activeFileId) {
                              return [...path, item.name];
                            }
                            if (item.children) {
                              const found = findPath(item.children, [
                                ...path,
                                item.name,
                              ]);
                              if (found) return found;
                            }
                          }
                          return null;
                        };

                        // Helper to recursively build nested folder structure for breadcrumb
                        const buildNestedContents = (items: FileItem[]): any[] => {
                          return items.map((item) => ({
                            label: item.name,
                            isFile: item.type === "file",
                            icon: item.type === "file" ? undefined : "folder",
                            onClick: () => {
                              if (item.type === "file") {
                                setActiveFileId(item.id);
                                if (
                                  !openFiles.find(
                                    (f) => f.id === item.id,
                                  )
                                ) {
                                  setOpenFiles([...openFiles, item]);
                                }
                              }
                            },
                            folderContents: item.children && item.children.length > 0
                              ? buildNestedContents(item.children)
                              : undefined,
                          }));
                        };

                        const pathSegments = findPath(fileStructure, []) || [];

                        const breadcrumbItems = pathSegments.map(
                          (segment, idx) => {
                            const isLast = idx === pathSegments.length - 1;

                            // Get folder contents for current breadcrumb segment
                            const findFolderContents = (
                              items: FileItem[],
                              targetPath: string[],
                            ): FileItem[] => {
                              if (targetPath.length === 0) return [];
                              if (targetPath.length === 1) {
                                const folder = items.find(
                                  (item) => item.name === targetPath[0],
                                );
                                return folder?.children || [];
                              }
                              const next = items.find(
                                (item) => item.name === targetPath[0],
                              );
                              if (next?.children) {
                                return findFolderContents(
                                  next.children,
                                  targetPath.slice(1),
                                );
                              }
                              return [];
                            };

                            const currentPath = pathSegments.slice(0, idx + 1);
                            const folderContents = findFolderContents(
                              fileStructure,
                              currentPath,
                            );

                            return {
                              label: segment,
                              isFile: isLast,
                              folderContents:
                                folderContents.length > 0
                                  ? buildNestedContents(folderContents)
                                  : undefined,
                            };
                          },
                        );

                        return breadcrumbItems;
                      };

                      return <Breadcrumb paths={buildBreadcrumbPaths()} />;
                    })()}
                </Box>
                {/* Editor */}
                <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                  {activeFileId ? (
                    <Editor
                      key={activeFileId}
                      height="100%"
                      language={currentLanguage}
                      defaultValue={fileContents[activeFileId] || ""}
                      onChange={handleCodeChange}
                      beforeMount={handleEditorWillMount}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: editorPreferences.minimap },
                        fontSize: 14,
                        lineNumbers: editorPreferences.lineNumbers ? "on" : "off",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: "none",
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: editorPreferences.wordWrap ? "on" : "off",
                        padding: { top: 16, bottom: 16 },
                        fontFamily:
                          "'Fira Code', 'Consolas', 'Courier New', monospace",
                        fontLigatures: true,
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "text.secondary",
                      }}
                    >
                      <Typography>Select a file to start editing</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Preview Section - Header + Content */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  bgcolor: "#0B0B12",
                }}
              >
                {/* Preview Header */}
                <Box
                  sx={{
                    height: "40px",
                    px: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#0B0B12",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#F5F5F7",
                      fontSize: "0.75rem",
                    }}
                  >
                    Preview
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Open in New Tab">
                      <IconButton
                        size="small"
                        onClick={handleOpenPreviewInNewTab}
                        sx={{ p: 0.5 }}
                      >
                        <OpenInNewIcon sx={{ fontSize: "0.9rem" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Collapse Preview">
                      <IconButton
                        size="small"
                        onClick={() => setPreviewCollapsed(true)}
                        sx={{ p: 0.5 }}
                      >
                        <KeyboardArrowLeftIcon sx={{ fontSize: "0.9rem" }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                {/* Preview Content */}
                <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                  <CodeExecutionEngine
                    componentCode={componentCode}
                    cssCode={cssCode}
                    dependencies={selectedDependencies}
                    allFiles={filePathMap}
                    height="100%"
                  />
                </Box>
              </Box>
            </Split>
          ) : (
            // When preview is collapsed, show only editor with expand button
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "100%",
              }}
            >
              {/* Breadcrumb Navigation */}
              <Box
                sx={{
                  height: "40px",
                  display: "flex",
                  borderBottom: "1px solid rgba(160, 160, 176, 0.1)",
                  flexShrink: 0,
                  overflow: "hidden",
                  alignItems: "center",
                  bgcolor: "rgba(10, 10, 15, 0.5)",
                }}
              >
                {activeFileId &&
                  (() => {
                    const buildBreadcrumbPaths = () => {
                      const file = findItemInStructure(
                        fileStructure,
                        activeFileId,
                      );
                      if (!file) return [];

                      const findPath = (
                        items: FileItem[],
                        path: string[],
                      ): string[] | null => {
                        for (const item of items) {
                          if (item.id === activeFileId) {
                            return [...path, item.name];
                          }
                          if (item.children) {
                            const found = findPath(item.children, [
                              ...path,
                              item.name,
                            ]);
                            if (found) return found;
                          }
                        }
                        return null;
                      };

                      // Helper to recursively build nested folder structure for breadcrumb
                      const buildNestedContents = (items: FileItem[]): any[] => {
                        return items.map((item) => ({
                          label: item.name,
                          isFile: item.type === "file",
                          icon: item.type === "file" ? undefined : "folder",
                          onClick: () => {
                            if (item.type === "file") {
                              setActiveFileId(item.id);
                              if (
                                !openFiles.find(
                                  (f) => f.id === item.id,
                                )
                              ) {
                                setOpenFiles([...openFiles, item]);
                              }
                            }
                          },
                          folderContents: item.children && item.children.length > 0
                            ? buildNestedContents(item.children)
                            : undefined,
                        }));
                      };

                      const pathSegments = findPath(fileStructure, []) || [];

                      const breadcrumbItems = pathSegments.map(
                        (segment, idx) => {
                          const isLast = idx === pathSegments.length - 1;

                          // Get folder contents for current breadcrumb segment
                          const findFolderContents = (
                            items: FileItem[],
                            targetPath: string[],
                          ): FileItem[] => {
                            if (targetPath.length === 0) return [];
                            if (targetPath.length === 1) {
                              const folder = items.find(
                                (item) => item.name === targetPath[0],
                              );
                              return folder?.children || [];
                            }
                            const next = items.find(
                              (item) => item.name === targetPath[0],
                            );
                            if (next?.children) {
                              return findFolderContents(
                                next.children,
                                targetPath.slice(1),
                              );
                            }
                            return [];
                          };

                          const currentPath = pathSegments.slice(0, idx + 1);
                          const folderContents = findFolderContents(
                            fileStructure,
                            currentPath,
                          );

                          return {
                            label: segment,
                            isFile: isLast,
                            folderContents:
                              folderContents.length > 0
                                ? buildNestedContents(folderContents)
                                : undefined,
                          };
                        },
                      );

                      return breadcrumbItems;
                    };

                    return <Breadcrumb paths={buildBreadcrumbPaths()} />;
                  })()}
              </Box>
              <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    bgcolor: "#0f0f1a",
                  }}
                >
                  {activeFileId ? (
                    <Editor
                      key={activeFileId}
                      height="100%"
                      language={currentLanguage}
                      defaultValue={fileContents[activeFileId] || ""}
                      onChange={handleCodeChange}
                      beforeMount={handleEditorWillMount}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: editorPreferences.minimap },
                        fontSize: 14,
                        lineNumbers: editorPreferences.lineNumbers ? "on" : "off",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: "none",
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: editorPreferences.wordWrap ? "on" : "off",
                        padding: { top: 16, bottom: 16 },
                        fontFamily:
                          "'Fira Code', 'Consolas', 'Courier New', monospace",
                        fontLigatures: true,
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "text.secondary",
                      }}
                    >
                      <Typography>Select a file to start editing</Typography>
                    </Box>
                  )}
                </Box>

                {/* Expand Preview Button */}
                <Box
                  sx={{
                    width: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(15, 15, 25, 0.6)",
                    borderLeft: "1px solid rgba(160, 160, 176, 0.1)",
                    flexShrink: 0,
                  }}
                >
                  <Tooltip title="Expand Preview">
                    <IconButton
                      size="small"
                      onClick={() => setPreviewCollapsed(false)}
                      sx={{ p: 0.5 }}
                    >
                      <KeyboardArrowRightIcon sx={{ fontSize: "0.9rem" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Problem Description Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            boxSizing: "border-box",
            mt: "56px",
            height: "calc(100vh - 56px)",
            backgroundColor: "#0f0f1a",
            borderRight: "1px solid rgba(79, 209, 255, 0.1)",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2.5,
              borderBottom: "1px solid rgba(79, 209, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 1.5, color: "#F5F5F7" }}
              >
                {problem.title}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={problem.difficulty.toUpperCase()}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.67rem",
                    ...(problem.difficulty === "easy" && {
                      backgroundColor: "#48BB78",
                      color: "#fff",
                    }),
                    ...(problem.difficulty === "hard" && {
                      backgroundColor: "#E74C3C",
                      color: "#fff",
                    }),
                    ...(problem.difficulty === "medium" && {
                      backgroundColor: "#E67E22",
                      color: "#fff",
                    }),
                  }}
                />
                <Chip
                  label={problem.category}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.67rem",
                    backgroundColor: "rgba(79, 209, 255, 0.15)",
                    color: "#4FD1FF",
                    border: "1px solid rgba(79, 209, 255, 0.2)",
                  }}
                />
              </Stack>
            </Box>
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(false)}
              sx={{ mt: -0.5 }}
            >
              <CloseIcon fontSize="small" sx={{ color: "#a0a0b0" }} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 2.5,
              overflowY: "auto",
              flexGrow: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(79, 209, 255, 0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(79, 209, 255, 0.3)",
                borderRadius: "4px",
                "&:hover": {
                  background: "rgba(79, 209, 255, 0.5)",
                },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: "#a0a0b0",
                fontSize: "0.9rem",
              }}
            >
              {problem.description}
            </Typography>
          </Box>
        </Box>
      </Drawer>
      
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(15, 15, 25, 0.95)",
            border: "1px solid rgba(79, 209, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#F5F5F7",
            fontWeight: 700,
            fontSize: "1.2rem",
          }}
        >
          Reset Code
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: "#a0a0b0",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to reset all changes? This action will restore the original code and all unsaved work will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setResetConfirmOpen(false)}
            variant="outlined"
            sx={{
              color: "#a0a0b0",
              borderColor: "rgba(160, 160, 176, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(160, 160, 176, 0.1)",
                borderColor: "rgba(160, 160, 176, 0.5)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReset}
            variant="contained"
            sx={{
              background: "#E74C3C",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                background: "#C0392B",
              },
            }}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      
      <DependencyManager
        open={dependencyDialogOpen}
        onClose={() => setDependencyDialogOpen(false)}
        selectedDependencies={selectedDependencies}
        onDependenciesChange={setSelectedDependencies}
      />
      
      <SettingsManager
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        wordWrap={editorPreferences.wordWrap}
        lineNumbers={editorPreferences.lineNumbers}
        minimap={editorPreferences.minimap}
        autoSave={editorPreferences.autoSave}
        onWordWrapChange={(val) => setEditorPreferences({ ...editorPreferences, wordWrap: val })}
        onLineNumbersChange={(val) => setEditorPreferences({ ...editorPreferences, lineNumbers: val })}
        onMinimapChange={(val) => setEditorPreferences({ ...editorPreferences, minimap: val })}
        onAutoSaveChange={(val) => setEditorPreferences({ ...editorPreferences, autoSave: val })}
      />
    </Box>
  );
}
