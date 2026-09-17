'use client';

import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function MediaUploader({ type, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Mock temporal
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);

          onUploadComplete(
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop'
          );

          return 100;
        }

        return prev + 10;
      });
    }, 200);
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {!uploading && (
        <Button
          component="label"
          variant="contained"
          size="small"
          startIcon={<CloudUploadIcon />}
          sx={{
            height: 40,
            px: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Subir {type === 'VIDEO' ? 'video' : 'imagen'}

          <input
            type="file"
            hidden
            accept={type === 'VIDEO' ? 'video/*' : 'image/*'}
            onChange={handleUpload}
          />
        </Button>
      )}

      {uploading && (
        <Box
          sx={{
            width: 200,
            py: 0.5,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ borderRadius: 1, height: 6 }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.5,
              fontWeight: 500,
            }}
          >
            Subiendo... {progress}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}