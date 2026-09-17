'use client';

import { createTheme } from '@mui/material/styles';

const ACTIVE_INDICATOR_COLOR = '#3B82C4'; // Lighter for dark mode visibility, original was #0B5CAB
const ACTIVE_INDICATOR_COLOR_LIGHT = '#0B5CAB';

export const getTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3B82C4' : '#0B5CAB',
        light: isDark ? '#5E92F3' : '#3B82C4',
        dark: isDark ? '#0B5CAB' : '#083B66',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#5E92F3' : '#1565C0',
        light: isDark ? '#82B1FF' : '#5E92F3',
        dark: isDark ? '#1565C0' : '#003C8F',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0F172A' : '#F5F7FA',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#1F2937',
        secondary: isDark ? '#94A3B8' : '#6B7280',
      },
      divider: isDark ? '#334155' : '#E5E7EB',
      success: { main: isDark ? '#4CAF50' : '#2E7D32' },
      warning: { main: isDark ? '#FF9800' : '#ED6C02' },
      error: { main: isDark ? '#F44336' : '#D32F2F' },
      info: { main: isDark ? '#29B6F6' : '#0288D1' },
    },

    custom: {
      drawerWidth: 272,
      drawerWidthCollapsed: 72,
    },

    typography: {
      fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif',
      h1: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 },
      h2: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.25 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '0.95rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
    },

    shape: { borderRadius: 8 },
    spacing: 8,

    components: {
      MuiButton: {
        defaultProps: { disableElevation: true, variant: 'contained' },
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { boxShadow: 'none' },
            '&:focus-visible': {
              outline: `3px solid ${isDark ? 'rgba(59, 130, 196, 0.25)' : 'rgba(11, 92, 171, 0.25)'}`,
              outlineOffset: 2,
            },
          },
          containedPrimary: { '&:hover': { backgroundColor: isDark ? '#0B5CAB' : '#083B66' } },
          outlinedPrimary: {
            borderWidth: 1,
            '&:hover': { borderWidth: 1, backgroundColor: isDark ? 'rgba(59, 130, 196, 0.1)' : '#EAF3FB' },
          },
          textPrimary: { '&:hover': { backgroundColor: isDark ? 'rgba(59, 130, 196, 0.1)' : '#EAF3FB' } },
          sizeSmall: { minHeight: 34, padding: '6px 14px' },
          sizeLarge: { minHeight: 46, padding: '10px 22px' },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': { 
              backgroundColor: isDark ? 'rgba(59, 130, 196, 0.1)' : '#EAF3FB', 
              color: isDark ? '#5E92F3' : '#0B5CAB' 
            },
            '&:focus-visible': { outline: `3px solid ${isDark ? 'rgba(59, 130, 196, 0.25)' : 'rgba(11, 92, 171, 0.25)'}` },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#3B82C4' : '#0B5CAB' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#3B82C4' : '#0B5CAB',
              borderWidth: 2,
            },
          },
          notchedOutline: { borderColor: isDark ? '#334155' : '#D1D5DB' },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { color: isDark ? '#94A3B8' : '#6B7280', '&.Mui-focused': { color: isDark ? '#3B82C4' : '#0B5CAB' } },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`, borderRadius: 12, backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'default' },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#F8FAFC' : '#1F2937',
            borderBottom: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
            boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.5)' : '0 1px 3px rgba(15, 23, 42, 0.05)',
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: 40, color: 'inherit' },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            position: 'relative',
            borderRadius: 8,
            marginBottom: 2,
            paddingTop: 8,
            paddingBottom: 8,
            transition: 'background-color 150ms ease, color 150ms ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: 0,
              borderRadius: '0 4px 4px 0',
              backgroundColor: isDark ? ACTIVE_INDICATOR_COLOR : ACTIVE_INDICATOR_COLOR_LIGHT,
              transition: 'height 150ms ease',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(59, 130, 196, 0.15)' : '#EAF3FB',
              color: isDark ? '#5E92F3' : '#0B5CAB',
              '& .MuiListItemIcon-root': { color: isDark ? '#5E92F3' : '#0B5CAB' },
              '&:hover': { backgroundColor: isDark ? 'rgba(59, 130, 196, 0.25)' : '#EAF3FB' },
              '&::before': { height: '60%' },
            },
            '&:hover': { backgroundColor: isDark ? '#334155' : '#F5F7FA' },
            '&:focus-visible': {
              outline: `2px solid ${isDark ? 'rgba(59, 130, 196, 0.4)' : 'rgba(11, 92, 171, 0.4)'}`,
              outlineOffset: -2,
            },
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `2px solid ${isDark ? '#334155' : '#E5E7EB'}`,
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: { border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`, borderRadius: 10, backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
        },
      },

      MuiTableHead: { styleOverrides: { root: { backgroundColor: isDark ? '#334155' : '#F1F5F9' } } },

      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`, padding: '12px 16px', fontSize: '0.875rem' },
          head: { fontWeight: 600, color: isDark ? '#F8FAFC' : '#374151', backgroundColor: isDark ? '#334155' : '#F1F5F9', whiteSpace: 'nowrap' },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
            '&:last-child td': { borderBottom: 0 },
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: { root: { borderTop: `1px solid ${isDark ? '#334155' : '#E5E7EB'}` }, toolbar: { minHeight: 56 } },
      },

      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}` } },
      },

      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#1F2937' } },
      },

      MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },

      MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },

      MuiLink: {
        styleOverrides: {
          root: {
            color: isDark ? '#3B82C4' : '#0B5CAB',
            fontWeight: 500,
            textDecoration: 'none',
            '&:hover': { color: isDark ? '#5E92F3' : '#083B66', textDecoration: 'underline' },
          },
        },
      },

      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: { backgroundColor: isDark ? '#0F172A' : '#1F2937', color: isDark ? '#F8FAFC' : '#FFFFFF', fontSize: '0.75rem', borderRadius: 6, border: isDark ? '1px solid #334155' : 'none' },
          arrow: { color: isDark ? '#0F172A' : '#1F2937' }
        },
      },

      MuiDivider: { styleOverrides: { root: { borderColor: isDark ? '#334155' : '#E5E7EB' } } },

      MuiFormHelperText: { styleOverrides: { root: { marginLeft: 0, marginRight: 0 } } },
    },
  });
};