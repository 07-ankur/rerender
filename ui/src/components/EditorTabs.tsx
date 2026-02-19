import React from 'react';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import type { FileItem } from './FileExplorer';
import { getFileIcon } from '../utils/fileIcons';

interface EditorTabsProps {
  openFiles: FileItem[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  openFiles,
  activeFileId,
  onSelectFile,
  onCloseFile,
}) => {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(155, 92, 255, 0.1)',
        backgroundColor: '#0B0B12',
        display: 'flex',
        alignItems: 'center',
        minHeight: '42px',
        overflow: 'auto',
        overflowY: 'hidden',
      }}
    >
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id;
        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingLeft: '16px',
              paddingRight: '8px',
              minHeight: '42px',
              minWidth: '120px',
              maxWidth: '200px',
              backgroundColor: isActive ? '#141423' : 'transparent',
              borderBottom: isActive ? '3px solid #9B5CFF' : 'none',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
              color: isActive ? '#F5F5F7' : '#A0A3BD',
              flex: '0 0 auto',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#1E1E2E';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              {getFileIcon(file.name, { size: 14 })}
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
              }}
            >
              {file.name}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                minWidth: '24px',
                minHeight: '24px',
                flexShrink: 0,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#F5F5F7' : '#A0A3BD',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(155, 92, 255, 0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = '#9B5CFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = isActive ? '#F5F5F7' : '#A0A3BD';
              }}
            >
              <CloseIcon sx={{ fontSize: '0.75rem' }} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;
