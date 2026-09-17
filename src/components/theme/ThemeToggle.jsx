'use client';

import { useThemeMode } from '@/hooks/useThemeMode';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

const ToggleContainer = styled('button')(({ theme }) => ({
  position: 'relative',
  width: '56px',
  height: '24px',
  borderRadius: '12px',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#4baee6', // Day sky blue
  transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.dark': {
    backgroundColor: '#141E30', // Night sky
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none !important',
    '& *': {
      transition: 'none !important',
      animation: 'none !important',
    }
  }
}));

const Knob = styled('div')({
  position: 'absolute',
  top: '3px',
  left: '3px',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: '#FFD700', // Sun color
  boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
  transition: 'transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), background-color 1.2s ease, box-shadow 1.2s ease',
  zIndex: 3,
  '&.dark': {
    transform: 'translateX(32px)',
    backgroundColor: '#E0E0E0', // Moon color
    boxShadow: 'inset -3px 1px 0px 0px rgba(0,0,0,0.1), 0 0 8px rgba(255, 255, 255, 0.4)',
  }
});

const Crater = styled('div')({
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.15)',
  opacity: 0,
  transition: 'opacity 1.2s ease',
  '&.dark': {
    opacity: 1,
  }
});

const Cloud = styled('div')({
  position: 'absolute',
  background: '#FFFFFF',
  borderRadius: '50px',
  transition: 'transform 1.2s ease, opacity 1.2s ease',
  zIndex: 2,
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    background: '#FFFFFF',
    borderRadius: '50%',
  }
});

const Cloud1 = styled(Cloud)({
  top: '11px',
  left: '20px',
  width: '20px',
  height: '7px',
  '&::before': { top: '-4px', left: '3px', width: '8px', height: '8px' },
  '&::after': { top: '-6px', left: '8px', width: '10px', height: '10px' },
  '&.dark': { transform: 'translateX(30px) scale(0.5)', opacity: 0 }
});

const Cloud2 = styled(Cloud)({
  top: '4px',
  left: '6px',
  width: '12px',
  height: '4px',
  opacity: 0.9,
  '&::before': { top: '-2px', left: '2px', width: '5px', height: '5px' },
  '&::after': { top: '-4px', left: '5px', width: '6px', height: '6px' },
  '&.dark': { transform: 'translateX(20px) scale(0.5)', opacity: 0 }
});

const Star = styled('div')({
  position: 'absolute',
  backgroundColor: '#FFFFFF',
  borderRadius: '50%',
  opacity: 0,
  transition: 'opacity 1.2s ease, transform 1.2s ease',
  transform: 'translateY(-10px)',
  '&.dark': {
    opacity: 0.8,
    transform: 'translateY(0)',
  }
});

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const modeClass = isDark ? 'dark' : '';

  return (
    <Tooltip title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}>
      <ToggleContainer
        className={modeClass}
        onClick={toggleTheme}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {/* Estrellas */}
        <Star className={modeClass} style={{ top: '5px', left: '10px', width: '2px', height: '2px' }} />
        <Star className={modeClass} style={{ top: '11px', left: '6px', width: '2px', height: '2px' }} />
        <Star className={modeClass} style={{ top: '15px', left: '18px', width: '2px', height: '2px' }} />
        <Star className={modeClass} style={{ top: '6px', left: '24px', width: '2px', height: '2px' }} />

        {/* Nubes */}
        <Cloud1 className={modeClass} />
        <Cloud2 className={modeClass} />

        {/* Perilla (Sol / Luna) */}
        <Knob className={modeClass}>
          <Crater className={modeClass} style={{ top: '3px', left: '4px', width: '3px', height: '3px' }} />
          <Crater className={modeClass} style={{ top: '8px', left: '8px', width: '5px', height: '5px' }} />
          <Crater className={modeClass} style={{ top: '5px', left: '13px', width: '3px', height: '3px' }} />
        </Knob>
      </ToggleContainer>
    </Tooltip>
  );
}
