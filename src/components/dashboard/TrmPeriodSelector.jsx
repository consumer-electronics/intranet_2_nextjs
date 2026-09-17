'use client';

import React from 'react';
import { Box, Button, useTheme } from '@mui/material';

const PERIODS = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1A', value: '1A' },
  { label: '5A', value: '5A' },
  { label: 'MAX', value: 'MAX' }
];

export default function TrmPeriodSelector({ selected, onChange }) {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 0.5, 
        py: 1,
        // Ocultar la barra de scroll
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      {PERIODS.map((period) => {
        const isSelected = selected === period.value;
        return (
          <Button
            key={period.value}
            variant={isSelected ? 'contained' : 'text'}
            size="small"
            disableElevation
            onClick={() => onChange(period.value)}
            sx={{
              minWidth: 'auto',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? 'primary.contrastText' : 'text.secondary',
              backgroundColor: isSelected ? 'primary.main' : 'transparent',
              '&:hover': {
                backgroundColor: isSelected ? 'primary.dark' : theme.palette.action.hover
              }
            }}
          >
            {period.label}
          </Button>
        );
      })}
    </Box>
  );
}
