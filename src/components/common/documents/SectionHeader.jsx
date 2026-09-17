'use client';

import { Box, Chip, Divider, Stack, Typography } from '@mui/material';

/**
 * Cabecera de sección con icono, título, chip y descripción opcional.
 *
 * Movido desde components/sig/common/SigSectionHeader.jsx
 * — eliminado el prefijo "Sig" para hacerlo globalmente reutilizable.
 *
 * NOTA DE USO:
 * Este componente es para títulos de SECCIÓN INTERNA dentro de una página.
 * El título principal de la página (h1) es responsabilidad del TopBar,
 * que lo deriva automáticamente de menuConfig.js.
 *
 * Props:
 * - title       {string}      Texto del título de sección.
 * - description {string}      Descripción opcional debajo del título.
 * - icon        {Component}   Componente de icono MUI (opcional).
 * - chipLabel   {string}      Etiqueta del chip (por defecto vacío; usar solo si aporta contexto).
 */
export default function SectionHeader({ title, description, icon: IconComponent, chipLabel }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
                {IconComponent && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            flexShrink: 0,
                        }}
                    >
                        <IconComponent fontSize="medium" />
                    </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                        >
                            {title}
                        </Typography>
                        {chipLabel && (
                            <Chip
                                label={chipLabel}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                    </Stack>
                    {description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {description}
                        </Typography>
                    )}
                </Box>
            </Stack>
            <Divider sx={{ mt: 2 }} />
        </Box>
    );
}
