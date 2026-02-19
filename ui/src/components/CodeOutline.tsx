import { Box, Typography, List, ListItem, ListItemText, TextField } from '@mui/material';
import { Code, DataObject, Settings } from '@mui/icons-material';
import { useState, useMemo } from 'react';

interface OutlineItem {
  name: string;
  type: 'function' | 'variable' | 'class' | 'hook';
  line?: number;
}

interface CodeOutlineProps {
  code: string;
  onLineClick?: (lineNumber: number) => void;
}

export default function CodeOutline({ code, onLineClick }: CodeOutlineProps) {
  const [searchFilter, setSearchFilter] = useState('');

  const outlineItems = useMemo(() => {
    if (!code) return [];

    const items: OutlineItem[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Match functions: function name(), const name = () => {}, const name = function() {}
      const functionMatch = trimmed.match(
        /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:function|\(|async))/
      );
      if (functionMatch) {
        const name = functionMatch[1] || functionMatch[2];
        if (name) {
          items.push({
            name,
            type: trimmed.includes('useEffect') || trimmed.includes('useState') ? 'hook' : 'function',
            line: index + 1,
          });
        }
      }

      // Match const/let/var declarations (not functions)
      if (!functionMatch) {
        const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=/);
        if (varMatch && !trimmed.includes('function') && !trimmed.includes('=>')) {
          items.push({
            name: varMatch[1],
            type: 'variable',
            line: index + 1,
          });
        }
      }

      // Match class definitions
      const classMatch = trimmed.match(/class\s+(\w+)/);
      if (classMatch) {
        items.push({
          name: classMatch[1],
          type: 'class',
          line: index + 1,
        });
      }
    });

    return items
      .filter((item) =>
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
      .slice(0, 50); // Limit to 50 items
  }, [code, searchFilter]);

  const getIcon = (type: OutlineItem['type']) => {
    switch (type) {
      case 'function':
      case 'hook':
        return <Code sx={{ fontSize: '16px', color: '#d4a574' }} />;
      case 'variable':
        return <DataObject sx={{ fontSize: '16px', color: '#9cdcfe' }} />;
      case 'class':
        return <Settings sx={{ fontSize: '16px', color: '#4ec9b0' }} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#252526',
        color: '#cccccc',
        fontSize: '12px',
      }}
    >
      <Box sx={{ padding: '8px', borderBottom: '1px solid #3e3e42' }}>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#cccccc',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          Outline
        </Typography>
        <TextField
          placeholder="Search symbols..."
          size="small"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              color: '#cccccc',
              fontSize: '12px',
              padding: '4px',
              backgroundColor: '#3e3e42',
              '& fieldset': {
                borderColor: '#3e3e42',
              },
              '&:hover fieldset': {
                borderColor: '#3e3e42',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0e639c',
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              opacity: 0.6,
            },
          }}
        />
      </Box>

      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '0',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1e1e',
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
        {outlineItems.length > 0 ? (
          outlineItems.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => item.line && onLineClick?.(item.line)}
              sx={{
                paddingX: '8px',
                paddingY: '6px',
                cursor: 'pointer',
                borderLeft: '2px solid transparent',
                '&:hover': {
                  borderLeftColor: '#0e639c',
                  backgroundColor: '#2d2d30',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                {getIcon(item.type)}
                <ListItemText
                  primary={item.name}
                  secondary={item.line ? `Ln ${item.line}` : undefined}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '12px',
                      color: '#cccccc',
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      fontSize: '11px',
                      color: '#858585',
                    },
                  }}
                />
              </Box>
            </ListItem>
          ))
        ) : (
          <Box sx={{ padding: '16px 8px', textAlign: 'center', color: '#858585', fontSize: '12px' }}>
            No symbols found
          </Box>
        )}
      </List>
    </Box>
  );
}
