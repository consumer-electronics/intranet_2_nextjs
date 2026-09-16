'use client';

import React from 'react';
import { Box, Typography, Grid, Skeleton, Stack } from '@mui/material';
import FeaturedContent from './FeaturedContent';
import ContentCard from './ContentCard';
import TrmWidget from './TrmWidget';
import { useDashboardContent } from '@/hooks/useDashboardContent';

export default function DashboardHome() {
  const { featured, regular, loading } = useDashboardContent({ estado: 'PUBLICADO' });

  // Primeras 2 tarjetas van al lado del TRM (apiladas), el resto va debajo
  const trmSideCards = regular?.slice(0, 2) ?? [];
  const restCards = regular?.slice(2) ?? [];

  return (
    <Box>
      {/* Fila 1: TRM (izquierda) + 2 cards apiladas (derecha) */}
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TrmWidget />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 2, minHeight: 160 }} />
              <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 2, minHeight: 160 }} />
            </Stack>
          ) : trmSideCards.length > 0 ? (
            <Stack spacing={2} sx={{ height: '100%' }}>
              {trmSideCards.map(content => (
                <Box key={content.id} sx={{ flex: 1, display: 'flex' }}>
                  <ContentCard content={content} />
                </Box>
              ))}
            </Stack>
          ) : null}
        </Grid>
      </Grid>

      {/* Fila 2: Contenido destacado (ancho completo) */}
      <FeaturedContent featured={featured} loading={loading} />

      {/* Fila 3: Noticias restantes en 2 columnas */}
      {(loading || restCards.length > 0) && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, fontWeight: 700, mb: 2, display: 'block' }}
          >
            Noticias y Comunicados
          </Typography>

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map(i => (
                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, width: '100%' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {restCards.map(content => (
                <Grid key={content.id} size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                  <ContentCard content={content} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}