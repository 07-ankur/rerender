import { useEffect, useRef, useState } from "react";
import { Alert } from "@mui/material";
import * as Babel from "@babel/standalone";
import { SiPreact } from "react-icons/si";

interface CodeExecutionEngineProps {
  componentCode: string;
  cssCode?: string;
  dependencies?: string[];
  height?: string;
  allFiles?: Record<string, string>; // relative path -> content (relative to src/)
}

const CDN_URLS: Record<string, string> = {
  // Utilities
  lodash: "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
  axios: "https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js",
  moment: "https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js",
  dayjs: "https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js",
  "date-fns": "https://cdn.jsdelivr.net/npm/date-fns@2.30.0/index.min.js",
  uuid: "https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/umd/uuidv4.min.js",
  nanoid: "https://cdn.jsdelivr.net/npm/nanoid@5.0.3/nanoid.js",
  clsx: "https://cdn.jsdelivr.net/npm/clsx@2.0.0/dist/clsx.min.js",
  classnames: "https://cdn.jsdelivr.net/npm/classnames@2.3.2/index.js",
  immer:
    "https://cdn.jsdelivr.net/npm/immer@10.0.3/dist/immer.umd.production.min.js",
  // State Management
  redux: "https://cdn.jsdelivr.net/npm/redux@4.2.1/dist/redux.min.js",
  "react-redux":
    "https://cdn.jsdelivr.net/npm/react-redux@8.1.3/dist/react-redux.min.js",
  "@reduxjs/toolkit":
    "https://cdn.jsdelivr.net/npm/@reduxjs/toolkit@1.9.7/dist/redux-toolkit.umd.min.js",
  zustand: "https://cdn.jsdelivr.net/npm/zustand@4.4.0/umd/index.production.js",
  // Forms & Validation
  formik:
    "https://cdn.jsdelivr.net/npm/formik@2.4.5/dist/formik.umd.production.min.js",
  yup: "https://cdn.jsdelivr.net/npm/yup@1.3.2/yup.min.js",
  zod: "https://cdn.jsdelivr.net/npm/zod@3.22.4/lib/index.umd.js",
  // UI & Styling
  "styled-components":
    "https://cdn.jsdelivr.net/npm/styled-components@6.1.1/dist/styled-components.min.js",
  "@emotion/react":
    "https://cdn.jsdelivr.net/npm/@emotion/react@11.11.1/dist/emotion-react.umd.min.js",
  "@emotion/styled":
    "https://cdn.jsdelivr.net/npm/@emotion/styled@11.11.0/dist/emotion-styled.umd.min.js",
  "@mui/system":
    "https://cdn.jsdelivr.net/npm/@mui/system@5.15.0/umd/mui-system.production.min.js",
  "@mui/material":
    "https://cdn.jsdelivr.net/npm/@mui/material@5.15.0/umd/material-ui.production.min.js",
  // Routing
  "react-router-dom":
    "https://cdn.jsdelivr.net/npm/react-router-dom@6.20.0/dist/umd/react-router-dom.production.min.js",
  // Animation
  "framer-motion":
    "https://cdn.jsdelivr.net/npm/framer-motion@10.16.5/dist/framer-motion.js",
  gsap: "https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js",
  // Charts
  "chart.js":
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  recharts: "https://cdn.jsdelivr.net/npm/recharts@2.10.1/umd/Recharts.min.js",
  // Icons
  "react-icons": "https://cdn.jsdelivr.net/npm/react-icons@4.12.0/lib/index.js",
  "@fortawesome/fontawesome-free":
    "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/js/all.min.js",
};

// ---------------------------------------------------------------------------
// Module helpers – convert ES module syntax to CommonJS-compatible code
// ---------------------------------------------------------------------------

function isReactImport(source: string): boolean {
  return [
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
  ].includes(source);
}

function formatNamedImports(raw: string): string {
  return (
    "{ " +
    raw
      .split(",")
      .map((n: string) => {
        const [a, b] = n.trim().split(/\s+as\s+/);
        return b ? `${a.trim()}: ${b.trim()}` : a.trim();
      })
      .filter(Boolean)
      .join(", ") +
    " }"
  );
}

function generatePathVariations(filePath: string): string[] {
  const set = new Set<string>();
  set.add(filePath);
  const noExt = filePath.replace(/\.(jsx?|tsx?)$/, "");
  if (noExt !== filePath) set.add(noExt);
  set.add("./" + filePath);
  if (noExt !== filePath) set.add("./" + noExt);
  return Array.from(set);
}

/**
 * Convert ES import / export statements in `code`.
 * – React-related imports are stripped (React is a global in the iframe).
 * – Relative imports become `require()` calls.
 * – Exports become `exports.*` assignments (module files only).
 * – For the main file exports are simply removed so `App` stays global.
 */
function processImportsExports(code: string, isMainFile: boolean): string {
  let result = code;
  const exportedNames: string[] = [];
  let defaultExportFnName: string | null = null;

  // --- Imports (order: most-specific patterns first) -----------------------

  // import Default, { named } from 'source'
  result = result.replace(
    /^import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm,
    (_, def, named, src) => {
      if (isReactImport(src)) return "";
      return `var __mod_${def}__ = require('${src}');\nvar ${def} = __mod_${def}__ && __mod_${def}__.__esModule ? __mod_${def}__.default : __mod_${def}__;\nvar ${formatNamedImports(named)} = __mod_${def}__;`;
    },
  );

  // import { named } from 'source'
  result = result.replace(
    /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm,
    (_, named, src) => {
      if (isReactImport(src)) return "";
      return `var ${formatNamedImports(named)} = require('${src}');`;
    },
  );

  // import * as Ns from 'source'
  result = result.replace(
    /^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm,
    (_, name, src) => {
      if (isReactImport(src)) return "";
      return `var ${name} = require('${src}');`;
    },
  );

  // import Default from 'source'
  result = result.replace(
    /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm,
    (_, name, src) => {
      if (isReactImport(src)) return "";
      return `var __mod_${name}__ = require('${src}');\nvar ${name} = __mod_${name}__ && __mod_${name}__.__esModule ? __mod_${name}__.default : __mod_${name}__;`;
    },
  );

  // import 'source' (side-effect only)
  result = result.replace(/^import\s+['"]([^'"]+)['"]\s*;?\s*$/gm, (_, src) => {
    if (isReactImport(src)) return "";
    return `require('${src}');`;
  });

  // --- Exports -------------------------------------------------------------

  if (isMainFile) {
    // Main file: strip all exports so `function App` stays a plain global
    result = result.replace(/^export\s+default\s+(function|class)\s+/gm, "$1 ");
    result = result.replace(/^export\s+default\s+/gm, "");
    result = result.replace(
      /^export\s+(function|class|const|let|var)\s+/gm,
      "$1 ",
    );
    result = result.replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, "");
  } else {
    // export default function/class Name
    result = result.replace(
      /^export\s+default\s+(function|class)\s+(\w+)/gm,
      (_, kw, name) => {
        defaultExportFnName = name;
        return `${kw} ${name}`;
      },
    );
    // export default <expr>
    result = result.replace(/^export\s+default\s+/gm, "exports.default = ");
    // export function/class Name
    result = result.replace(
      /^export\s+(function|class)\s+(\w+)/gm,
      (_, kw, name) => {
        exportedNames.push(name);
        return `${kw} ${name}`;
      },
    );
    // export const/let/var Name
    result = result.replace(
      /^export\s+(const|let|var)\s+(\w+)/gm,
      (_, kw, name) => {
        exportedNames.push(name);
        return `${kw} ${name}`;
      },
    );
    // export { x, y as z }
    result = result.replace(/^export\s+\{([^}]+)\}\s*;?\s*$/gm, (_, names) =>
      names
        .split(",")
        .map((n: string) => {
          const [local, alias] = n.trim().split(/\s+as\s+/);
          return `exports.${(alias || local).trim()} = ${local.trim()};`;
        })
        .join("\n"),
    );

    // Append module.exports assignments
    if (defaultExportFnName)
      result += `\nexports.default = ${defaultExportFnName};`;
    result += "\nexports.__esModule = true;";
    for (const n of exportedNames) result += `\nexports.${n} = ${n};`;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CodeExecutionEngine({
  componentCode,
  cssCode = "",
  dependencies = [],
  height = "100%",
  allFiles = {},
}: CodeExecutionEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setError("");
    setIsLoading(true);

    const timer = setTimeout(() => {
      try {
        if (!componentCode || componentCode.trim() === "") {
          setIsLoading(false);
          return;
        }

        // ---- Build module factories for every non-main file ----
        const moduleRegistrations: string[] = [];
        const cssModuleEntries: string[] = [];

        for (const [filePath, content] of Object.entries(allFiles)) {
          // Skip the main App file (passed separately as componentCode)
          if (/^App\.(jsx?|tsx?)$/.test(filePath)) continue;
          // Skip the root index entry-point
          if (/^index\.(jsx?|tsx?)$/.test(filePath)) continue;

          // CSS → register as a CSS module
          if (filePath.endsWith(".css")) {
            for (const v of generatePathVariations(filePath)) {
              cssModuleEntries.push(
                `${JSON.stringify(v)}: ${JSON.stringify(content)}`,
              );
            }
            continue;
          }

          // JS / JSX / TS / TSX → transpile into a module factory
          if (/\.(jsx?|tsx?)$/.test(filePath)) {
            try {
              const processed = processImportsExports(content, false);
              const transpiled =
                (Babel as any).transform(processed, {
                  presets: ["react"],
                  filename: filePath,
                }).code || "";

              const pathsLiteral = generatePathVariations(filePath)
                .map((v) => JSON.stringify(v))
                .join(", ");

              moduleRegistrations.push(
                `[${pathsLiteral}].forEach(function(__p__){` +
                  `__moduleFactories__[__p__]=function(module,exports,require){\n` +
                  `${transpiled}\n};});`,
              );
            } catch (e: any) {
              console.warn(
                "Module transpile error (" + filePath + "):",
                e.message,
              );
            }
          }
        }

        // ---- Transpile the main component code ----
        let mainTranspiled = "";
        try {
          const processedMain = processImportsExports(componentCode, true);
          mainTranspiled =
            (Babel as any).transform(processedMain, {
              presets: ["react"],
              filename: "App.jsx",
            }).code || "";
        } catch (babelError: any) {
          setError(`Compilation Error: ${babelError.message}`);
          setIsLoading(false);
          return;
        }

        // ---- Assemble iframe HTML ----
        const iframeContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  padding: 20px;
                  background: linear-gradient(135deg, #f5f5f7 0%, #f0f0f5 100%);
                  color: #1a1a1f;
                }
                #root { width: 100%; }
                button {
                  padding: 10px 16px; margin: 4px; border-radius: 8px;
                  border: none; background-color: #4FD1FF;
                  color: white; cursor: pointer; font-size: 14px; font-family: inherit;
                  font-weight: 600; transition: all 300ms ease;
                  box-shadow: 0 4px 15px rgba(79, 209, 255, 0.3);
                }
                button:hover { 
                  background-color: #7FE1FF;
                  box-shadow: 0 8px 25px rgba(79, 209, 255, 0.5);
                  transform: translateY(-2px);
                }
                input, textarea {
                  padding: 10px 12px; margin: 4px; border: 1.5px solid #4FD1FF;
                  border-radius: 8px; font-size: 14px; font-family: inherit;
                  background-color: rgba(245, 245, 247, 0.8);
                  color: #1a1a1f;
                  transition: all 300ms ease;
                  box-shadow: 0 0 15px rgba(79, 209, 255, 0.15);
                }
                input:focus, textarea:focus {
                  outline: none;
                  border-color: #4FD1FF;
                  box-shadow: 0 0 30px rgba(79, 209, 255, 0.3), inset 0 0 10px rgba(79, 209, 255, 0.08);
                  background-color: rgba(245, 245, 247, 1);
                }
                /* User Custom Styles */
                ${cssCode || ""}
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
              ${dependencies
                .map((dep) => {
                  const url = CDN_URLS[dep];
                  return url ? `<script src="${url}"><\/script>` : "";
                })
                .join("\n              ")}
              <script>
                (function() {
                  /* ---- Virtual Module System ---- */
                  var __moduleFactories__ = {};
                  var __moduleCache__     = {};
                  var __cssModules__      = {${cssModuleEntries.join(",")}};

                  /* Map CDN packages to their global variable names */
                  var __cdnGlobals__ = {
                    'axios': 'axios',
                    'lodash': '_',
                    'moment': 'moment',
                    'dayjs': 'dayjs',
                    'uuid': 'uuid',
                    'nanoid': 'nanoid',
                    'clsx': 'clsx',
                    'classnames': 'classnames',
                    'redux': 'Redux',
                    'react-redux': 'ReactRedux',
                    'zustand': 'create',
                    'formik': 'Formik',
                    'yup': 'yup',
                    'zod': 'z',
                    'styled-components': 'styled',
                    '@emotion/react': 'emotionReact',
                    '@emotion/styled': 'emotionStyled',
                    '@mui/system': 'MuiSystem',
                    '@mui/material': 'MaterialUI',
                    'react-router-dom': 'ReactRouterDOM',
                    'framer-motion': 'FramerMotion',
                    'gsap': 'gsap',
                    'chart.js': 'Chart',
                    'recharts': 'Recharts',
                    'react-icons': 'reactIcons',
                  };

                  function require(id) {
                    /* built-ins */
                    if (id === 'react')            return React;
                    if (id === 'react-dom')        return ReactDOM;
                    if (id === 'react-dom/client') return ReactDOM;

                    /* CDN packages */
                    if (__cdnGlobals__[id]) {
                      var globalName = __cdnGlobals__[id];
                      if (typeof window[globalName] !== 'undefined') {
                        return window[globalName];
                      }
                      console.warn('[CDN package loading] ' + id + ' (expected global: ' + globalName + ')');
                    }

                    /* normalise */
                    var n = id.replace(/^\\.\\//g, '');
                    var tryPaths = [
                      id, n,
                      n+'.jsx', n+'.js', n+'.tsx', n+'.ts',
                      n+'/index.jsx', n+'/index.js',
                      './'+n, './'+n+'.jsx', './'+n+'.js',
                    ];

                    /* CSS modules */
                    for (var i = 0; i < tryPaths.length; i++) {
                      if (__cssModules__.hasOwnProperty(tryPaths[i])) {
                        if (!__moduleCache__[tryPaths[i]]) {
                          __moduleCache__[tryPaths[i]] = { exports: {} };
                          var s = document.createElement('style');
                          s.textContent = __cssModules__[tryPaths[i]];
                          document.head.appendChild(s);
                        }
                        return __moduleCache__[tryPaths[i]].exports;
                      }
                    }

                    /* Handle @scope/package subpaths like @mui/material/Alert */
                    var basePkg = id.startsWith('@') ? id.split('/').slice(0, 2).join('/') : id.split('/')[0];
                    if (__cdnGlobals__[basePkg]) {
                      var globalName = __cdnGlobals__[basePkg];
                      if (typeof window[globalName] !== 'undefined') {
                        return window[globalName];
                      }
                    }

                    /* JS modules */
                    var resolved = null;
                    for (var j = 0; j < tryPaths.length; j++) {
                      if (__moduleFactories__[tryPaths[j]]) { resolved = tryPaths[j]; break; }
                    }
                    if (!resolved) { console.warn('[Module not found]', id); return {}; }
                    if (__moduleCache__[resolved]) return __moduleCache__[resolved].exports;

                    var module = { exports: {} };
                    __moduleCache__[resolved] = module;
                    __moduleFactories__[resolved](module, module.exports, require);
                    return module.exports;
                  }

                  try {
                    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
                      document.getElementById('root').innerHTML =
                        '<div style="color:red;padding:20px;">Failed to load React. Check connection.</div>';
                      return;
                    }

                    /* React hooks available as globals */
                    var useState      = React.useState;
                    var useEffect     = React.useEffect;
                    var useRef        = React.useRef;
                    var useMemo       = React.useMemo;
                    var useCallback   = React.useCallback;
                    var useReducer    = React.useReducer;
                    var useContext    = React.useContext;
                    var useLayoutEffect = React.useLayoutEffect;
                    var createContext = React.createContext;
                    var useId         = React.useId;
                    var Fragment      = React.Fragment;

                    /* ---- Register module factories ---- */
                    ${moduleRegistrations.join("\n                    ")}

                    /* ---- Execute main module ---- */
                    ${mainTranspiled}

                    if (typeof App !== 'undefined') {
                      var root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(React.createElement(App));
                    } else {
                      document.getElementById('root').innerHTML =
                        '<div style="color:#666;padding:20px;text-align:center;">No App component found.</div>';
                    }
                  } catch (err) {
                    console.error('Runtime error:', err);
                    var errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'color:red;padding:20px;font-family:monospace;white-space:pre-wrap;background:#fee;border:1px solid #fcc;border-radius:4px;margin:10px;';
                    errorDiv.textContent = 'Runtime Error:\\n' + err.message + '\\n\\n' + err.stack;
                    document.body.innerHTML = '';
                    document.body.appendChild(errorDiv);
                  }
                })();
              <\/script>
            </body>
          </html>
        `;

        // Write content to iframe
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(iframeContent);
          iframeDoc.close();
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Execution error:", err);
        setError(`Execution Error: ${err.message}`);
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [componentCode, cssCode, dependencies, allFiles]);

  return (
    <div
      style={{
        height,
        width: "100%",
        position: "relative",
        display: "block",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            m: 2,
          }}
        >
          {error}
        </Alert>
      )}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            animation: "fadeInOut 1.5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              opacity: 0.8,
            }}
          >
            <SiPreact size={48} color="black" />
          </div>
          <div
            style={{
              color: "#333333",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            Building preview...
          </div>
          <style>{`
            @keyframes fadeInOut {
              0%, 100% {
                opacity: 0.6;
              }
              50% {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "#ffffff",
          display: "block",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
        title="Code Preview"
      />
    </div>
  );
}
