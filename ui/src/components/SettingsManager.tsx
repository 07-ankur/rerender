import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Stack,
  Paper,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const KEYBOARD_SHORTCUTS = [
  {
    action: "Save File",
    shortcut: "Ctrl + S",
    description: "Save current file",
  },
  {
    action: "Open File",
    shortcut: "Ctrl + O",
    description: "Open file dialog",
  },
  { action: "Find", shortcut: "Ctrl + F", description: "Find in current file" },
  { action: "Replace", shortcut: "Ctrl + H", description: "Find and replace" },
  {
    action: "Format Document",
    shortcut: "Shift + Alt + F",
    description: "Format code",
  },
  {
    action: "Comment Line",
    shortcut: "Ctrl + /",
    description: "Toggle line comment",
  },
  { action: "Undo", shortcut: "Ctrl + Z", description: "Undo last action" },
  {
    action: "Redo",
    shortcut: "Ctrl + Shift + Z",
    description: "Redo last action",
  },
  {
    action: "Go to Line",
    shortcut: "Ctrl + G",
    description: "Jump to specific line",
  },
  {
    action: "Toggle Preview",
    shortcut: "Ctrl + Shift + P",
    description: "Toggle preview pane",
  },
  {
    action: "Reset Code",
    shortcut: "Ctrl + Shift + R",
    description: "Reset to original code",
  },
  {
    action: "Expand Line",
    shortcut: "Alt + Shift + Down",
    description: "Expand current line",
  },
];

interface SettingsManagerProps {
  open: boolean;
  onClose: () => void;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: boolean;
  onWordWrapChange: (value: boolean) => void;
  onLineNumbersChange: (value: boolean) => void;
  onMinimapChange: (value: boolean) => void;
  onAutoSaveChange: (value: boolean) => void;
}

export default function SettingsManager({
  open,
  onClose,
  wordWrap,
  lineNumbers,
  minimap,
  autoSave,
  onWordWrapChange,
  onLineNumbersChange,
  onMinimapChange,
  onAutoSaveChange,
}: SettingsManagerProps) {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
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
          borderBottom: "1px solid rgba(79, 209, 255, 0.15)",
        }}
      >
        Settings
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          sx={{
            borderBottom: "1px solid rgba(79, 209, 255, 0.15)",
            backgroundColor: "rgba(10, 10, 15, 0.3)",
          }}
        >
          <Tab label="Editor Preferences" id="settings-tab-0" />
          <Tab label="Keyboard Shortcuts" id="settings-tab-1" />
        </Tabs>

        {/* Editor Preferences Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2.5}>
            <Box
              sx={{ pb: 2, borderBottom: "1px solid rgba(79, 209, 255, 0.1)" }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#9b5cff", mb: 1.5 }}
              >
                Editor Display
              </Typography>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={wordWrap}
                      onChange={(e) => onWordWrapChange(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4FD1FF",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "rgba(79, 209, 255, 0.3)",
                          },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: "#F5F5F7", fontWeight: 500 }}>
                        Word Wrap
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                        Wrap long lines
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={lineNumbers}
                      onChange={(e) => onLineNumbersChange(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4FD1FF",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "rgba(79, 209, 255, 0.3)",
                          },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: "#F5F5F7", fontWeight: 500 }}>
                        Line Numbers
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                        Show line numbers
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={minimap}
                      onChange={(e) => onMinimapChange(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4FD1FF",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "rgba(79, 209, 255, 0.3)",
                          },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: "#F5F5F7", fontWeight: 500 }}>
                        Minimap
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                        Show code minimap on right
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#9b5cff", mb: 1.5 }}
              >
                File & Save
              </Typography>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSave}
                      onChange={(e) => onAutoSaveChange(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4FD1FF",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "rgba(79, 209, 255, 0.3)",
                          },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: "#F5F5F7", fontWeight: 500 }}>
                        Auto Save
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                        Save changes automatically
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>
          </Stack>
        </TabPanel>
        {/* Keyboard Shortcuts Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon sx={{ color: "#a0a0b0", fontSize: "1.2rem" }} />
            <Typography sx={{ color: "#a0a0b0", fontSize: "0.9rem" }}>
              Keyboard shortcuts are read-only
            </Typography>
          </Box>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "rgba(15, 15, 25, 0.5)",
              border: "1px solid rgba(79, 209, 255, 0.1)",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(79, 209, 255, 0.08)" }}>
                  <TableCell sx={{ color: "#9b5cff", fontWeight: 600 }}>
                    Action
                  </TableCell>
                  <TableCell sx={{ color: "#9b5cff", fontWeight: 600 }}>
                    Keyboard Shortcut
                  </TableCell>
                  <TableCell sx={{ color: "#9b5cff", fontWeight: 600 }}>
                    Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {KEYBOARD_SHORTCUTS.map((item, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(79, 209, 255, 0.05)",
                      },
                      borderBottom: "1px solid rgba(79, 209, 255, 0.1)",
                    }}
                  >
                    <TableCell sx={{ color: "#F5F5F7" }}>
                      {item.action}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4FD1FF",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.shortcut}
                    </TableCell>
                    <TableCell sx={{ color: "#a0a0b0", fontSize: "0.9rem" }}>
                      {item.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderTop: "1px solid rgba(79, 209, 255, 0.15)" }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ backgroundColor: "#4FD1FF", color: "#000" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
