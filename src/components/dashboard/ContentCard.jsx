'use client';

import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';

export default function ContentCard({ content }) {
  const { titulo, descripcion, tipo, tipoMedia, mediaUrl, thumbnailUrl, fechaPublicacion } = content;
  
  const displayUrl = tipoMedia === 'VIDEO' ? (thumbnailUrl || mediaUrl) : mediaUrl;
  
  return (
    <Card sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      borderRadius: 2,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
    }}>
      {displayUrl && (
        <CardMedia
          component={tipoMedia === 'VIDEO' && !thumbnailUrl ? 'video' : 'img'}
          height={160}
          image={displayUrl}
          alt={titulo}
          controls={tipoMedia === 'VIDEO'}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, py: 2, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip label={tipo} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          {fechaPublicacion && (
            <Typography variant="caption" color="text.secondary">
              {new Date(fechaPublicacion).toLocaleDateString()}
            </Typography>
          )}
        </Box>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          fontSize: '0.8rem'
        }}>
          {descripcion}
        </Typography>
      </CardContent>
    </Card>
  );
}
