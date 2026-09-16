'use client';

import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Skeleton } from '@mui/material';

export default function FeaturedContent({ featured = [], loading = false }) {
  if (loading) {
    return <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />;
  }

  if (!featured || featured.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {featured.map((content) => {
        const displayUrl = content.tipoMedia === 'VIDEO' ? (content.thumbnailUrl || content.mediaUrl) : content.mediaUrl;
        return (
    <Card key={content.id} sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      maxHeight: { md: 300 },      // Limita la altura en desktop/laptop
      overflow: 'hidden',
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      {displayUrl && (
        <CardMedia
          component={content.tipoMedia === 'VIDEO' && !content.thumbnailUrl ? 'video' : 'img'}
          sx={{
            width: { xs: '100%', md: '45%' },
            height: { xs: 180, md: 'auto' },
            objectFit: 'cover',
            flexShrink: 0,
          }}
          image={displayUrl}
          alt={content.titulo}
          controls={content.tipoMedia === 'VIDEO'}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', p: { xs: 1.5, md: 2 } }}>
        <CardContent sx={{ flex: '1 0 auto', p: 0, '&:last-child': { pb: 0 } }}>
          <Chip label="Destacado" color="secondary" size="small" sx={{ mb: 1 }} />
          <Typography component="div" variant="h5" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {content.titulo}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: { xs: 3, md: 4 },
              WebkitBoxOrient: 'vertical',
            }}
          >
            {content.descripcion}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Publicado el: {new Date(content.fechaPublicacion).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Box>
    </Card>
        );
      })}
    </Box>
  );
}
