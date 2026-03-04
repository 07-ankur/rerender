import {
  FaFolder,
  FaJs,
  FaReact,
  FaCss3Alt,
  FaHtml5,
  FaFile,
  FaImage,
  FaCog,
  FaDatabase,
} from 'react-icons/fa';

interface IconConfig {
  size?: number;
  color?: string;
}

// Color mapping for file types
const fileTypeColors: Record<string, string> = {
  js: '#F7DF1E',      // JavaScript yellow
  jsx: '#61DAFB',     // React cyan
  ts: '#3178C6',      // TypeScript blue
  tsx: '#61DAFB',     // React cyan
  json: '#F5DE19',    // JSON yellow
  css: '#264BDD',     // CSS blue
  scss: '#C6538C',    // SCSS pink
  html: '#E34C26',    // HTML orange
  png: '#4CAF50',     // Image green
  jpg: '#4CAF50',     // Image green
  jpeg: '#4CAF50',    // Image green
  gif: '#4CAF50',     // Image green
  svg: '#4CAF50',     // Image green
  webp: '#4CAF50',    // Image green
  yaml: '#CB171E',    // YAML red
  yml: '#CB171E',     // YAML red
  toml: '#9C4221',    // TOML brown
  xml: '#FF6B6B',     // XML red
  config: '#666666',  // Config gray
  env: '#666666',     // ENV gray
  ini: '#666666',     // INI gray
  folder: '#a0a0b0',  // Folder light gray
  file: '#cccccc',    // File light gray
};

export function getFileIcon(fileName: string, config?: IconConfig) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const size = config?.size || 16;
  const color = config?.color || fileTypeColors[extension] || fileTypeColors.file;
  const iconProps = { size, style: { marginRight: '4px', color } };

  switch (extension) {
    case 'js':
      return <FaJs {...iconProps} />;
    case 'jsx':
      return <FaReact {...iconProps} />;
    case 'ts':
    case 'tsx':
      return <FaReact {...iconProps} />;
    case 'json':
      return <FaDatabase {...iconProps} />;
    case 'css':
    case 'scss':
      return <FaCss3Alt {...iconProps} />;
    case 'html':
    case 'htm':
      return <FaHtml5 {...iconProps} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FaImage {...iconProps} />;
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'xml':
    case 'config':
    case 'env':
    case 'ini':
      return <FaCog {...iconProps} />;
    default:
      return <FaFile {...iconProps} />;
  }
}

export function getFolderIcon(config?: IconConfig) {
  const size = config?.size || 16;
  const color = config?.color || fileTypeColors.folder;
  return <FaFolder size={size} style={{ marginRight: '4px', color }} />;
}

export { fileTypeColors };
