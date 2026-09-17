'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import TrmWidget from './TrmWidget';

export default function DashboardHome() {


  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TrmWidget />
        </Grid>
      </Grid>
    </Box>
  );
}