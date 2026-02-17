import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a',
      paper: '#0f0f1a',
    },
    primary: {
      main: '#4FD1FF', // Electric Blue - PRIMARY
      light: '#7FE1FF',
      dark: '#2FB1FF',
    },
    secondary: {
      main: '#9B5CFF', // Neon Purple - ACCENT
      light: '#B08FFF',
      dark: '#7B3CFF',
    },
    info: {
      main: '#5B2EFF', // Deep Violet
    },
    error: {
      main: '#E74C3C',
    },
    warning: {
      main: '#E67E22',
    },
    success: {
      main: '#48BB78',
    },
    text: {
      primary: '#F5F5F7',
      secondary: '#a0a0b0',
    },
    divider: '#1a1a28',
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '0.95rem',
      letterSpacing: '-0.003em',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#A0A3BD',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.7)',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(79, 209, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '24px',
          boxShadow: '0 0 30px rgba(79, 209, 255, 0.4), 0 4px 20px rgba(79, 209, 255, 0.2)',
          background: 'linear-gradient(135deg, #4FD1FF 0%, #5B2EFF 100%)',
          color: 'white',
          '&:hover': {
            boxShadow: '0 0 50px rgba(79, 209, 255, 0.6), 0 8px 32px rgba(79, 209, 255, 0.4)',
            transform: 'translateY(-2px)',
            background: 'linear-gradient(135deg, #7FE1FF 0%, #7B3CFF 100%)',
            color: 'white',
          },
          transition: 'all 300ms ease',
        },
        outlined: {
          textTransform: 'none',
          fontWeight: 500,
          borderColor: '#4FD1FF',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(79, 209, 255, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(79, 209, 255, 0.1)',
            borderColor: '#4FD1FF',
            color: 'white',
            boxShadow: '0 0 40px rgba(79, 209, 255, 0.5)',
          },
          transition: 'all 300ms ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(15, 15, 25, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #4FD1FF',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(79, 209, 255, 0.2)',
            '& fieldset': {
              borderColor: '#4FD1FF',
            },
            '&:hover fieldset': {
              borderColor: '#4FD1FF',
              boxShadow: '0 0 25px rgba(79, 209, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4FD1FF',
              boxShadow: '0 0 35px rgba(79, 209, 255, 0.4), inset 0 0 10px rgba(79, 209, 255, 0.1)',
            },
          },
          '& .MuiInputBase-input': {
            color: '#F5F5F7',
          },
          '& .MuiInputBase-input::placeholder': {
            opacity: 0.5,
            color: '#a0a0b0',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 15, 25, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(79, 209, 255, 0.2)',
          boxShadow: '0 0 25px rgba(79, 209, 255, 0.15), inset 0 0 20px rgba(79, 209, 255, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          backgroundColor: 'rgba(79, 209, 255, 0.15)',
          color: '#4FD1FF',
          border: '1px solid #4FD1FF',
          boxShadow: '0 0 15px rgba(79, 209, 255, 0.25)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 71, 87, 0.1)',
          color: '#FF6B7A',
          border: '1px solid rgba(255, 71, 87, 0.2)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(160, 160, 176, 0.1)',
          color: '#a0a0b0',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          fontFamily: "'Inter', 'Poppins', 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          fontSize: '16px',
          lineHeight: '1.5',
          fontWeight: 400,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        'h1, h2, h3, h4, h5, h6': {
          margin: 0,
          padding: 0,
        },
        a: {
          color: '#4FD1FF',
          textDecoration: 'none',
          transition: 'all 300ms ease',
          '&:hover': {
            color: '#9B5CFF',
          },
        },
        '::selection': {
          background: 'rgba(155, 92, 255, 0.4)',
          color: '#F5F5F7',
        },
        '::-moz-selection': {
          background: 'rgba(155, 92, 255, 0.4)',
          color: '#F5F5F7',
        },
        button: {
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 300ms ease',
          color: 'white',
        },
        'input, textarea, select': {
          fontFamily: 'inherit',
          color: '#F5F5F7',
          '&::placeholder': {
            color: '#7a7a8d',
            opacity: 1,
          },
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(20, 20, 35, 0.3)',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(155, 92, 255, 0.5)',
          borderRadius: '4px',
          transition: 'background 300ms ease',
          '&:hover': {
            background: 'rgba(155, 92, 255, 0.8)',
          },
        },
        '.gutter': {
          backgroundColor: '#0b0b12',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50%',
          cursor: 'col-resize',
          transition: 'background 300ms ease',
          borderLeft: '1px solid rgba(155, 92, 255, 0.05)',
          borderRight: '1px solid rgba(155, 92, 255, 0.05)',
          '&:hover': {
            background: 'rgba(155, 92, 255, 0.08) !important',
            borderLeft: '1px solid rgba(155, 92, 255, 0.15)',
            borderRight: '1px solid rgba(155, 92, 255, 0.15)',
          },
        },
        '.gutter.gutter-horizontal': {
          backgroundColor: '#0b0b12',
          cursor: 'col-resize',
        },
        '.gutter.gutter-vertical': {
          cursor: 'row-resize',
        },
        '.split': {
          display: 'flex',
          flexDirection: 'row',
        },
      },
    },
  },
});
