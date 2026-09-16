'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCard from '@/components/dashboard/ContentCard';

export default function ContentPreview({ open, onClose, content }) {
  if (!content) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Vista Previa
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 4 }}>
        <ContentCard content={content} />
      </DialogContent>
    </Dialog>
  );
}
