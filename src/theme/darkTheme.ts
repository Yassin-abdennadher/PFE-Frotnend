import { createTheme } from '@mui/material';

export const getTheme = (darkMode: boolean) => createTheme({
    palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
        }, text: {
            primary: darkMode ? '#ffffff' : '#000000',
            secondary: darkMode ? '#b0b0b0' : '#666666',
        }
    }, components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                }
            }
        }
    }
});