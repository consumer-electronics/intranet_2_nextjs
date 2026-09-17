'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, IconButton, Stack, Divider, Link as MuiLink } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTrm } from '@/hooks/useTrm';
import TrmPeriodSelector from './TrmPeriodSelector';
import TrmChart from './TrmChart';

export default function TrmWidget() {
  const { currentTrm, history, loading, loadingHistory, error, historyRange, changeRange } = useTrm();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton width="40%" height={30} />
          <Skeleton width="60%" height={60} />
          <Skeleton width="100%" height={200} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography color="error">No fue posible consultar la TRM en este momento.</Typography>
          <MuiLink href="https://www.superfinanciera.gov.co/" target="_blank" underline="hover" sx={{ mt: 1, display: 'block' }}>
            Ver fuente oficial →
          </MuiLink>
        </CardContent>
      </Card>
    );
  }

  if (!currentTrm) return null;

  // Determine if variation is positive or negative based on current vs previous day
  // History is assumed to be ordered ascending (oldest first, newest last) or based on our fetch logic
  // Wait, if range is 1M, history is ordered oldest to newest.
  // The line color should indicate if the FIRST point in the selected range to the LAST point is up or down.
  let isUp = true;
  if (history && history.length > 1) {
    const firstVal = history[0].valor;
    const lastVal = history[history.length - 1].valor;
    isUp = lastVal >= firstVal;
  }

  // Variación del período seleccionado: diferencia entre el primer y último valor del historial
  // Esto se recalcula automáticamente cada vez que cambia historyRange o history
  let periodVariation = 0;
  let periodVariationPercent = 0;
  if (history && history.length > 1) {
    const firstVal = history[0].valor;
    const lastVal = history[history.length - 1].valor;
    periodVariation = lastVal - firstVal;
    periodVariationPercent = ((periodVariation / firstVal) * 100);
  } else {
    // Si no hay historial suficiente, usar el valor de hoy vs ayer como fallback
    periodVariation = currentTrm.current.variation;
    periodVariationPercent = currentTrm.current.variationPercent;
  }
  const isCurrentUp = periodVariation >= 0;

  // Etiqueta del período para el indicador
  const periodLabel = historyRange === '1D' ? 'Hoy' : historyRange;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header - Title & Link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
              TRM OFICIAL COLOMBIA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
              USD / COP
            </Typography>
          </Box>
          <IconButton 
            component="a" 
            href="https://www.google.com/finance/beta/quote/USD-COP?window=5D" 
            target="_blank" 
            size="small" 
            title="Ver USD/COP de mercado en Google Finance"
          >
            <OpenInNewIcon fontSize="small" color="action" />
          </IconButton>
        </Box>
        
        {/* Current Value & Variation */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
            ${currentTrm.current.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: isCurrentUp ? 'success.main' : 'error.main',
                bgcolor: isCurrentUp ? 'success.50' : 'error.50', // Assuming MUI theme has 50 shade, else fallback
                px: 1,
                py: 0.25,
                borderRadius: 1
              }}
            >
              {isCurrentUp ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                {isCurrentUp ? '+' : ''}{periodVariation.toFixed(2)} ({isCurrentUp ? '+' : ''}{periodVariationPercent.toFixed(2)}%)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {periodLabel}
            </Typography>
          </Stack>
        </Box>
        
        {/* Chart Area */}
        <Box sx={{ minHeight: 160, position: 'relative', flexGrow: 1 }}>
          {loadingHistory && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, bgcolor: 'rgba(255,255,255,0.6)' }}>
               <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          )}
          <TrmChart data={history} isUp={isUp} />
        </Box>

        {/* Period Selector */}
        <Box sx={{ mt: 1, mb: 1.5 }}>
          <TrmPeriodSelector selected={historyRange} onChange={changeRange} />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Footer Info */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Vigencia: <strong>{currentTrm.current.date}</strong>
          </Typography>
          <MuiLink href={currentTrm.source.url} target="_blank" variant="caption" color="text.secondary" underline="hover">
            Fuente: {currentTrm.source.name}
          </MuiLink>
        </Stack>

      </CardContent>
    </Card>
  );
}
