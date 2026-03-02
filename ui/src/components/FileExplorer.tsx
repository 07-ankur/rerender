import React from 'react';
import {
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  Menu,
  MenuItem,
  Dialog,
  TextField,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  CreateNewFolder as CreateNewFolderIcon,
  NoteAdd as NoteAddIcon,
  ContentCopy as CopyIcon,
  Edit as RenameIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getFileIcon, getFolderIcon } from '../utils/fileIcons';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: 'javascript' | 'css';
  content: string;
  children?: FileItem[];
}

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile?: (parentId: string, name: string, language?: 'javascript' | 'css') => void;
  onCreateFolder?: (parentId: string, name: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onCopyItem?: (itemId: string) => void;
  onRenameItem?: (itemId: string, newName: string) => void;
  hideHeader?: boolean;
}

export interface FileExplorerHandle {
  triggerCreateFile: () => void;
  triggerCreateFolder: () => void;
}

const FileExplorer = React.forwardRef<FileExplorerHandle, FileExplorerProps>(({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteItem,
  onCopyItem,
  onRenameItem,
  hideHeader = false,
}, ref) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(['src', files[0]?.id])
  );
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
  } | null>(null);
  const [createDialog, setCreateDialog] = React.useState<{
    open: boolean;
    type: 'file' | 'folder';
    parentId: string;
    language?: 'javascript' | 'css';
  } | null>(null);
  const [renameDialog, setRenameDialog] = React.useState<{
    open: boolean;
    itemId: string;
    currentName: string;
  } | null>(null);
  const [createName, setCreateName] = React.useState('');
  const [renameName, setRenameName] = React.useState('');

  const handleCreateFileInternal = (parentId: string, language?: 'javascript' | 'css') => {
    setCreateDialog({
      open: true,
      type: 'file',
      parentId,
      language,
    });
  };

  const handleCreateFolderInternal = (parentId: string) => {
    setCreateDialog({
      open: true,
      type: 'folder',
      parentId,
    });
  };

  const handleRenameClick = (itemId: string) => {
    const item = findItemById(files, itemId);
    if (item) {
      setRenameName(item.name);
      setRenameDialog({
        open: true,
        itemId,
        currentName: item.name,
      });
    }
    handleCloseContextMenu();
  };

  const handleCopyClick = (itemId: string) => {
    const item = findItemById(files, itemId);
    if (item) {
      onCopyItem?.(itemId);
    }
    handleCloseContextMenu();
  };

  const handleConfirmRename = () => {
    if (!renameName.trim() || !renameDialog) return;
    if (renameName === renameDialog.currentName) {
      setRenameDialog(null);
      setRenameName('');
      return;
    }
    onRenameItem?.(renameDialog.itemId, renameName);
    setRenameDialog(null);
    setRenameName('');
  };

  React.useImperativeHandle(ref, () => ({
    triggerCreateFile: () => handleCreateFileInternal('', 'javascript'),
    triggerCreateFolder: () => handleCreateFolderInternal(''),
  }));

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      itemId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleConfirmCreate = () => {
    if (!createName.trim() || !createDialog) return;

    if (createDialog.type === 'file') {
      onCreateFile?.(
        createDialog.parentId,
        createName,
        createDialog.language
      );
    } else {
      onCreateFolder?.(createDialog.parentId, createName);
    }

    setCreateName('');
    setCreateDialog(null);
    handleCloseContextMenu();
  };

  const renderFileItemIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return getFolderIcon({ size: 16 });
    }
    return getFileIcon(item.name, { size: 16 });
  };

  const renderFileItem = (item: FileItem, depth: number = 0) => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(item.id);
    const isActive = activeFileId === item.id;

    return (
      <React.Fragment key={item.id}>
        <ListItemButton
          onClick={() => {
            if (isFolder) {
              toggleFolder(item.id);
            } else {
              onSelectFile(item.id);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
          sx={{
            pl: `${8 + depth * 20}px`,
            pr: 1,
            py: '4px',
            minHeight: '22px',
            bgcolor: isActive ? '#1e1e1e' : 'transparent',
            borderLeft: isActive ? '3px solid #0e639c' : '3px solid transparent',
            '&:hover': {
              bgcolor: '#2d2d30',
              borderLeftColor: isActive ? '#0e639c' : 'transparent',
            },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 0.25,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
            {isFolder && (
              <Box sx={{ display: 'flex', alignItems: 'center', width: '16px', justifyContent: 'center' }}>
                {isExpanded ? (
                  <ExpandLessIcon sx={{ fontSize: '16px', color: '#858585' }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: '16px', color: '#858585' }} />
                )}
              </Box>
            )}
            {!isFolder && <Box sx={{ width: '16px' }} />}
            <ListItemIcon sx={{ minWidth: '20px' }}>
              {renderFileItemIcon(item)}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                sx: {
                  fontSize: '12px',
                  color: isActive ? '#cccccc' : '#cccccc',
                  fontWeight: isActive ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          </Box>
        </ListItemButton>
        {isFolder && item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {item.children.map((child) => renderFileItem(child, depth + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #3e3e42',
          bgcolor: '#252526',
          color: '#e0e0e0',
        }}
      >
        {/* Header */}
        {!hideHeader && (
        <Box sx={{ p: '8px 8px 8px 16px', borderBottom: '1px solid #3e3e42', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#cccccc', letterSpacing: '0.5px' }}>
            Explorer
          </Typography>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: '4px' }}>
            <Tooltip title="New File">
              <IconButton
                size="small"
                onClick={() => handleCreateFileInternal('', 'javascript')}
                sx={{
                  padding: '4px',
                  color: '#858585',
                  '&:hover': { 
                    color: '#e8e8e8',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  },
                }}
              >
                <NoteAddIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Folder">
              <IconButton
                size="small"
                onClick={() => handleCreateFolderInternal('')}
                sx={{
                  padding: '4px',
                  color: '#858585',
                  '&:hover': { 
                    color: '#e8e8e8',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  },
                }}
              >
                <CreateNewFolderIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        )}

        {/* File List */}
        <List
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '0',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#252526',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#464647',
              borderRadius: '5px',
              '&:hover': {
                background: '#5a5a5a',
              },
            },
          }}
        >
          {files.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="caption">No files yet</Typography>
            </Box>
          ) : (
            files.map((file) => renderFileItem(file))
          )}
        </List>
      </Paper>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorPosition={
          contextMenu
            ? { left: contextMenu.mouseX, top: contextMenu.mouseY }
            : undefined
        }
        anchorReference="anchorPosition"
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: '#3e3e42',
            minWidth: '200px',
          },
          '& .MuiMenuItem-root': {
            fontSize: '12px',
            color: '#cccccc',
            '&:hover': {
              backgroundColor: '#1e1e1e',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const item = findItemById(files, contextMenu?.itemId || '');
            if (item?.type === 'folder') {
              handleCreateFileInternal(contextMenu?.itemId || '', 'javascript');
            }
          }}
        >
          <NoteAddIcon fontSize="small" sx={{ mr: 1, color: '#cccccc' }} />
          New File
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCreateFolderInternal(contextMenu?.itemId || '');
          }}
        >
          <CreateNewFolderIcon fontSize="small" sx={{ mr: 1, color: '#cccccc' }} />
          New Folder
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopyClick(contextMenu?.itemId || '');
          }}
        >
          <CopyIcon fontSize="small" sx={{ mr: 1, color: '#cccccc' }} />
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRenameClick(contextMenu?.itemId || '');
          }}
        >
          <RenameIcon fontSize="small" sx={{ mr: 1, color: '#cccccc' }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDeleteItem?.(contextMenu?.itemId || '');
            handleCloseContextMenu();
          }}
          sx={{ color: '#ff6b6b !important' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: '#ff6b6b' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={createDialog?.open || false}
        onClose={() => {
          setCreateDialog(null);
          setCreateName('');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#252526',
            color: '#cccccc',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#cccccc', fontSize: '14px', fontWeight: 600 }}>
              Create {createDialog?.type === 'file' ? 'File' : 'Folder'}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setCreateDialog(null);
                setCreateName('');
              }}
              sx={{ color: '#858585' }}
            >
              <CloseIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Box>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={
              createDialog?.type === 'file'
                ? 'e.g., App.jsx'
                : 'e.g., components'
            }
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirmCreate();
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                backgroundColor: '#3e3e42',
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#555',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0e639c',
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                opacity: 0.5,
              },
            }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={() => {
                setCreateDialog(null);
                setCreateName('');
              }}
              variant="outlined"
              sx={{
                color: '#cccccc',
                borderColor: '#555',
                '&:hover': {
                  borderColor: '#858585',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreate}
              variant="contained"
              disabled={!createName.trim()}
              sx={{
                backgroundColor: '#0e639c',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1177bb',
                },
                '&:disabled': {
                  backgroundColor: '#3e3e42',
                  color: '#555',
                },
              }}
            >
              Create
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog?.open || false}
        onClose={() => {
          setRenameDialog(null);
          setRenameName('');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#252526',
            color: '#cccccc',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#cccccc', fontSize: '14px', fontWeight: 600 }}>
              Rename Item
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setRenameDialog(null);
                setRenameName('');
              }}
              sx={{ color: '#858585' }}
            >
              <CloseIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Box>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirmRename();
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                backgroundColor: '#3e3e42',
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#555',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0e639c',
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                opacity: 0.5,
              },
            }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={() => {
                setRenameDialog(null);
                setRenameName('');
              }}
              variant="outlined"
              sx={{
                color: '#cccccc',
                borderColor: '#555',
                '&:hover': {
                  borderColor: '#858585',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRename}
              variant="contained"
              disabled={!renameName.trim()}
              sx={{
                backgroundColor: '#0e639c',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1177bb',
                },
                '&:disabled': {
                  backgroundColor: '#3e3e42',
                  color: '#555',
                },
              }}
            >
              Rename
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
});

FileExplorer.displayName = 'FileExplorer';

// Helper function to find item by ID
function findItemById(items: FileItem[], id: string): FileItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export default FileExplorer;
