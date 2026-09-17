'use client';

import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton, Stack, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';
import { useTrm } from '@/hooks/useTrm';
import TrmWidget from './TrmWidget';

export default function TrmMiniWidget() {
  const { currentTrm, loading, error } = useTrm();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 110, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <CardContent>
          <Skeleton width="40%" height={24} />
          <Skeleton width="80%" height={40} />
        </CardContent>
      </Card>
    );
  }

  if (error || !currentTrm) {
    return null;
  }

  const periodVariation = currentTrm.current.variation;
  const periodVariationPercent = currentTrm.current.variationPercent;
  const isCurrentUp = periodVariation >= 0;

  return (
    <>
      <Card 
        onClick={() => setOpen(true)}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          borderRadius: 2, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, pb: { xs: 2, md: 2.5 } + ' !important' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1, display: 'block', mb: 0.5, lineHeight: 1 }}>
            TRM ACTUAL
          </Typography>
          
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px', mb: 0.5 }}>
            ${currentTrm.current.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: isCurrentUp ? 'success.main' : 'error.main',
                bgcolor: isCurrentUp ? 'success.50' : 'error.50',
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
          </Stack>
        </CardContent>
      </Card>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Histórico TRM</Typography>
          <IconButton onClick={() => setOpen(false)} size="small" edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, '& .MuiCard-root': { boxShadow: 'none', border: 'none', borderRadius: 0 } }}>
          <TrmWidget />
        </DialogContent>
      </Dialog>
    </>
  );
}
