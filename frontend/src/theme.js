import { createTheme } from '@mui/material/styles';
import { esES as dataGridEsES } from '@mui/x-data-grid/locales';

export const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#003558',
        dark: '#00243d',
      },
      secondary: {
        main: '#CE5D2A',
      },
      background: {
        default: '#F4F6F8',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#676867',
      },
      success: { main: '#2E7D32' },
      warning: { main: '#CE5D2A' },
      error: { main: '#C62828' },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, padding: '9px 22px' },
          sizeSmall: { padding: '6px 16px' },
          sizeLarge: { padding: '12px 28px' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', color: '#676867' },
        },
      },
    },
  },
  dataGridEsES
);
