'use client';

import React from 'react';
import { Grid, Typography, Skeleton, Box } from '@mui/material';
import ContentCard from './ContentCard';

export default function NewsSection({ contents = [], loading = false }) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map(i => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!contents || contents.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay contenido disponible por el momento.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={0} sx={{ gap: 2 }}>
      {contents.map(content => (
        <Grid item xs={12} key={content.id}>
          <ContentCard content={content} />
        </Grid>
      ))}
    </Grid>
  );
}
