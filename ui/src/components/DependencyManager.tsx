import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
  Typography,
  TextField,
  Checkbox,
  Tabs,
  Tab,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface Dependency {
  name: string;
  version: string;
  globalName: string;
  description: string;
  category?: string;
  downloads?: string;
  license?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DependencyManagerProps {
  open: boolean;
  onClose: () => void;
  selectedDependencies: string[];
  onDependenciesChange: (deps: string[]) => void;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dep-tabpanel-${index}`}
      aria-labelledby={`dep-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export const POPULAR_DEPENDENCIES: Dependency[] = [
  // ── UI Frameworks ──────────────────────────────────────────────
  {
    name: '@mui/material',
    version: '5.15.0',
    globalName: 'MaterialUI',
    description: 'React components that implement Google\'s Material Design.',
    category: 'UI Frameworks',
    downloads: '3.8M',
    license: 'MIT',
  },
  {
    name: '@mui/icons-material',
    version: '5.15.0',
    globalName: 'MaterialIcons',
    description: 'Material Design icons distributed as SVG React components.',
    category: 'UI Frameworks',
    downloads: '2.9M',
    license: 'MIT',
  },
  {
    name: '@emotion/react',
    version: '11.11.1',
    globalName: 'emotionReact',
    description: 'CSS-in-JS library designed for high performance style composition.',
    category: 'UI Frameworks',
    downloads: '6.2M',
    license: 'MIT',
  },
  {
    name: '@emotion/styled',
    version: '11.11.0',
    globalName: 'emotionStyled',
    description: 'Styled API for @emotion/react – write styles with a styled-components-like API.',
    category: 'UI Frameworks',
    downloads: '5.5M',
    license: 'MIT',
  },
  {
    name: 'styled-components',
    version: '6.1.1',
    globalName: 'styled',
    description: 'Visual primitives for the component age. Use the best bits of ES6 and CSS.',
    category: 'UI Frameworks',
    downloads: '5.8M',
    license: 'MIT',
  },
  // ── Routing ────────────────────────────────────────────────────
  {
    name: 'react-router-dom',
    version: '6.20.0',
    globalName: 'ReactRouterDOM',
    description: 'Declarative routing for React web applications.',
    category: 'Routing',
    downloads: '9.8M',
    license: 'MIT',
  },
  // ── State Management ───────────────────────────────────────────
  {
    name: 'zustand',
    version: '4.4.0',
    globalName: 'zustand',
    description: 'Small, fast, and scalable bearbones state management solution.',
    category: 'State Management',
    downloads: '2.5M',
    license: 'MIT',
  },
  {
    name: 'redux',
    version: '4.2.1',
    globalName: 'Redux',
    description: 'Predictable state container for JavaScript apps.',
    category: 'State Management',
    downloads: '7.5M',
    license: 'MIT',
  },
  {
    name: 'react-redux',
    version: '8.1.3',
    globalName: 'ReactRedux',
    description: 'Official React bindings for Redux.',
    category: 'State Management',
    downloads: '6.2M',
    license: 'MIT',
  },
  {
    name: '@reduxjs/toolkit',
    version: '1.9.7',
    globalName: 'RTK',
    description: 'The official, opinionated, batteries-included toolset for Redux.',
    category: 'State Management',
    downloads: '3.8M',
    license: 'MIT',
  },
  {
    name: 'immer',
    version: '10.0.3',
    globalName: 'immer',
    description: 'Create the next immutable state by mutating the current one.',
    category: 'State Management',
    downloads: '8.1M',
    license: 'MIT',
  },
  {
    name: 'react-query',
    version: '3.39.3',
    globalName: 'ReactQuery',
    description: 'Powerful asynchronous state management for server state.',
    category: 'State Management',
    downloads: '4.2M',
    license: 'MIT',
  },
  {
    name: 'swr',
    version: '2.2.4',
    globalName: 'useSWR',
    description: 'React Hooks for data fetching by Vercel.',
    category: 'State Management',
    downloads: '2.6M',
    license: 'MIT',
  },
  // ── HTTP & Data ────────────────────────────────────────────────
  {
    name: 'axios',
    version: '1.6.0',
    globalName: 'axios',
    description: 'Promise based HTTP client for the browser and node.js.',
    category: 'HTTP & Data',
    downloads: '28.5M',
    license: 'MIT',
  },
  // ── Forms & Validation ─────────────────────────────────────────
  {
    name: 'react-hook-form',
    version: '7.48.2',
    globalName: 'ReactHookForm',
    description: 'Performant, flexible and extensible forms with easy-to-use validation.',
    category: 'Forms & Validation',
    downloads: '3.9M',
    license: 'MIT',
  },
  {
    name: 'formik',
    version: '2.4.5',
    globalName: 'Formik',
    description: 'Build forms in React without the tears.',
    category: 'Forms & Validation',
    downloads: '2.1M',
    license: 'Apache-2.0',
  },
  {
    name: 'yup',
    version: '1.3.2',
    globalName: 'Yup',
    description: 'Schema builder for runtime value parsing and validation.',
    category: 'Forms & Validation',
    downloads: '4.5M',
    license: 'MIT',
  },
  {
    name: 'zod',
    version: '3.22.4',
    globalName: 'z',
    description: 'TypeScript-first schema validation with static type inference.',
    category: 'Forms & Validation',
    downloads: '5.1M',
    license: 'MIT',
  },
  // ── Animation ──────────────────────────────────────────────────
  {
    name: 'framer-motion',
    version: '10.16.5',
    globalName: 'FramerMotion',
    description: 'A production-ready motion library for React.',
    category: 'Animation',
    downloads: '3.2M',
    license: 'MIT',
  },
  {
    name: 'gsap',
    version: '3.12.2',
    globalName: 'gsap',
    description: 'Professional-grade JavaScript animation for the modern web.',
    category: 'Animation',
    downloads: '1.5M',
    license: 'Standard',
  },
  // ── Utilities ──────────────────────────────────────────────────
  {
    name: 'lodash',
    version: '4.17.21',
    globalName: '_',
    description: 'A modern JavaScript utility library delivering modularity, performance & extras.',
    category: 'Utilities',
    downloads: '40.2M',
    license: 'MIT',
  },
  {
    name: 'uuid',
    version: '9.0.0',
    globalName: 'uuid',
    description: 'RFC4122 (v1, v4, and v5) UUIDs for JavaScript.',
    category: 'Utilities',
    downloads: '32.1M',
    license: 'MIT',
  },
  {
    name: 'nanoid',
    version: '5.0.3',
    globalName: 'nanoid',
    description: 'A tiny, secure, URL-friendly unique string ID generator.',
    category: 'Utilities',
    downloads: '15.8M',
    license: 'MIT',
  },
  {
    name: 'clsx',
    version: '2.0.0',
    globalName: 'clsx',
    description: 'A tiny utility for constructing className strings conditionally.',
    category: 'Utilities',
    downloads: '22.1M',
    license: 'MIT',
  },
  {
    name: 'classnames',
    version: '2.3.2',
    globalName: 'classNames',
    description: 'A simple utility for conditionally joining classNames together.',
    category: 'Utilities',
    downloads: '8.9M',
    license: 'MIT',
  },
  // ── Date & Time ────────────────────────────────────────────────
  {
    name: 'moment',
    version: '2.29.4',
    globalName: 'moment',
    description: 'Parse, validate, manipulate, and display dates in JavaScript.',
    category: 'Date & Time',
    downloads: '18.3M',
    license: 'MIT',
  },
  {
    name: 'date-fns',
    version: '2.30.0',
    globalName: 'dateFns',
    description: 'Modern JavaScript date utility library. 200+ functions.',
    category: 'Date & Time',
    downloads: '8.5M',
    license: 'MIT',
  },
  {
    name: 'dayjs',
    version: '1.11.10',
    globalName: 'dayjs',
    description: 'Fast 2kB alternative to Moment.js with the same modern API.',
    category: 'Date & Time',
    downloads: '12.4M',
    license: 'MIT',
  },
  // ── Charts & Visualization ────────────────────────────────────
  {
    name: 'recharts',
    version: '2.10.1',
    globalName: 'Recharts',
    description: 'A composable charting library built on React components.',
    category: 'Charts',
    downloads: '1.8M',
    license: 'MIT',
  },
  {
    name: 'chart.js',
    version: '4.4.1',
    globalName: 'Chart',
    description: 'Simple yet flexible JavaScript charting library.',
    category: 'Charts',
    downloads: '2.9M',
    license: 'MIT',
  },
  // ── Icons ──────────────────────────────────────────────────────
  {
    name: 'react-icons',
    version: '4.12.0',
    globalName: 'ReactIcons',
    description: 'Popular icon sets for React (Font Awesome, Feather, Material, and more).',
    category: 'Icons',
    downloads: '3.2M',
    license: 'MIT',
  },
  {
    name: '@fortawesome/fontawesome-free',
    version: '6.4.0',
    globalName: 'FontAwesome',
    description: 'The world\'s most popular icon library and toolkit.',
    category: 'Icons',
    downloads: '5.1M',
    license: 'MIT',
  },
];

const DependencyManager: React.FC<DependencyManagerProps> = ({
  open,
  onClose,
  selectedDependencies,
  onDependenciesChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Get list of available packages
  const availablePackages = useMemo(
    () => new Set(POPULAR_DEPENDENCIES.map((d) => d.name)),
    []
  );

  const categories = useMemo(
    () => [...new Set(POPULAR_DEPENDENCIES.map((d) => d.category))],
    []
  );

  const filteredDependencies = useMemo(() => {
    return POPULAR_DEPENDENCIES.filter((dep) =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const dependenciesByCategory = useMemo(() => {
    const grouped: Record<string, Dependency[]> = {};
    categories.forEach((cat) => {
      if (cat) {
        grouped[cat] = POPULAR_DEPENDENCIES.filter((d) => d.category === cat);
      }
    });
    return grouped;
  }, [categories]);

  const handleToggleDependency = (depName: string) => {
    if (selectedDependencies.includes(depName)) {
      onDependenciesChange(selectedDependencies.filter((d) => d !== depName));
    } else {
      onDependenciesChange([...selectedDependencies, depName]);
    }
  };

  const DependencyCard = ({ dep, isSelected }: { dep: Dependency; isSelected: boolean }) => (
    <Card
      sx={{
        mb: 1.5,
        border: isSelected ? '1px solid #9b5cff' : '1px solid rgba(155, 92, 255, 0.1)',
        backgroundColor: isSelected ? 'rgba(155, 92, 255, 0.08)' : 'rgba(155, 92, 255, 0.02)',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(155, 92, 255, 0.15)',
          backgroundColor: 'rgba(155, 92, 255, 0.05)',
        },
      }}
      onClick={() => handleToggleDependency(dep.name)}
    >
      <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Checkbox
            checked={isSelected}
            onChange={() => handleToggleDependency(dep.name)}
            onClick={(e) => e.stopPropagation()}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#e8e8e8' }}>
                {dep.name}
              </Typography>
              <Chip
                label={dep.version}
                size="small"
                variant="outlined"
                sx={{ height: '20px', fontSize: '0.75rem' }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#a0a0a0',
                fontSize: '0.85rem',
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {dep.description}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              {dep.downloads && (
                <Tooltip title="Weekly Downloads">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DownloadIcon sx={{ fontSize: '0.875rem', color: '#888' }} />
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {dep.downloads}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {dep.license && (
                <Tooltip title="License">
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    {dep.license}
                  </Typography>
                </Tooltip>
              )}
              {dep.category && (
                <Chip
                  label={dep.category}
                  size="small"
                  variant="outlined"
                  sx={{ height: '20px', fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          height: '80vh',
          bgcolor: '#141423',
          backgroundImage: 'none',
          border: '1px solid rgba(155, 92, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(155, 92, 255, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Manage Dependencies</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ borderBottom: 1 }}>
        <Tab label="Browse" id="dep-tab-0" />
        <Tab label={`Installed (${selectedDependencies.length})`} id="dep-tab-1" />
      </Tabs>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {/* Browse Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
          </Box>
          <Box>
            {searchQuery ? (
              filteredDependencies.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">No packages found</Typography>
                </Box>
              ) : (
                filteredDependencies.map((dep) => (
                  <DependencyCard
                    key={dep.name}
                    dep={dep}
                    isSelected={selectedDependencies.includes(dep.name)}
                  />
                ))
              )
            ) : (
              categories.map(
                (category) =>
                  category && (
                    <Box key={category} sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#9b5cff' }}>
                        {category}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        {dependenciesByCategory[category]?.map((dep) => (
                          <DependencyCard
                            key={dep.name}
                            dep={dep}
                            isSelected={selectedDependencies.includes(dep.name)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )
              )
            )}
          </Box>
        </TabPanel>

        {/* Installed Tab */}
        <TabPanel value={tabValue} index={1}>
          {selectedDependencies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No dependencies installed yet</Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#e8e8e8' }}>
                {selectedDependencies.length} Installed Packages
              </Typography>
              {selectedDependencies.map((dep) => {
                const depInfo = POPULAR_DEPENDENCIES.find((d) => d.name === dep);
                return (
                  <Box
                    key={dep}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 1,
                      backgroundColor: 'rgba(155, 92, 255, 0.05)',
                      borderRadius: 1,
                      border: '1px solid rgba(155, 92, 255, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(155, 92, 255, 0.08)' },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e8e8e8' }}>
                        {dep}
                      </Typography>
                      {depInfo && (
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          {depInfo.version}
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => handleToggleDependency(dep)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          )}
        </TabPanel>
      </DialogContent>



      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DependencyManager;
