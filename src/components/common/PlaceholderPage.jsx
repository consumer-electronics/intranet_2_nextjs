'use client'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ConstructionIcon from '@mui/icons-material/ConstructionOutlined';

/**
 * src/components/common/PlaceholderPage.jsx
 *
 * Reutilizable para cualquier módulo del sidebar que aún vive en el
 * PHP legado y no se ha migrado (ver punto 10 del brief: "puedes
 * crear temporalmente una ruta placeholder claramente identificada").
 * No inventa funcionalidad ni datos — solo confirma que la ruta
 * existe y qué módulo reemplazará.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, maxWidth: 640 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <ConstructionIcon color="warning" fontSize="large" />
        <Typography variant="h5">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <Chip label="Módulo pendiente de migrar" color="warning" variant="outlined" size="small" />
      </Stack>
    </Paper>
  );
}