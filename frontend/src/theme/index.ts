import { createTheme, ThemeOptions } from '@mui/material/styles'

// Color palette inspired by modern inventory management systems
const palette = {
  primary: {
    main: '#1976d2', // Professional blue
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0', // Purple accent
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32', // Green for positive actions
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02', // Orange for warnings
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f', // Red for errors/critical
    light: '#f44336',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1', // Light blue for info
    light: '#03a9f4',
    dark: '#01579b',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
}

const typography = {
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 300,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 400,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
}

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        borderRight: '1px solid #e0e0e0',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        border: '1px solid #e0e0e0',
        '& .MuiDataGrid-cell': {
          borderColor: '#f0f0f0',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#fafafa',
          borderBottom: '2px solid #e0e0e0',
        },
      },
    },
  },
}

const themeOptions: ThemeOptions = {
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
}

export const theme = createTheme(themeOptions)

// Dark theme variant
export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    ...palette,
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
})

export default theme