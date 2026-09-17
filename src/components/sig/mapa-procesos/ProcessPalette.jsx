'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';

import FolderExplorerModal from '../info-documentada/FolderExplorerModal';
import { PROCESS_COLOR_VARIANTS } from '@/config/sig/mapaProcesos';

/**
 * Botón de proceso del Mapa de Procesos.
 *
 * Refactorizado: de ButtonBase (apariencia de botón rectangular)
 * a enlace de texto interactivo elegante con:
 * - Cambio de color al hacer hover (primary.main del theme).
 * - Subrayado animado progresivo (borde inferior).
 * - Transición suave de todos los efectos.
 * - cursor pointer explícito.
 * - Indicador de código de proceso en chip de color temático.
 *
 * Props:
 * - process {object}  Objeto de proceso con code, title, colorVariant, folderPath.
 */
export default function ProcessPalette({ process }) {
    const [open, setOpen] = useState(false);

    const variant = PROCESS_COLOR_VARIANTS[process.colorVariant] || PROCESS_COLOR_VARIANTS.orange;

    return (
        <>
            <Box
                component="button"
                onClick={() => setOpen(true)}
                aria-label={`Ver documentos de ${process.title}`}
                sx={{
                    // Reset de estilos de botón nativo
                    appearance: 'none',
                    background: 'none',
                    border: 'none',
                    p: 0,
                    // Layout
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    cursor: 'pointer',
                    // Estilo del contenedor
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 1.25 },
                    borderRadius: 1.5,
                    position: 'relative',
                    // Línea inferior animada
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: '2px',
                        borderRadius: '2px',
                        bgcolor: variant.main,
                        transition: 'width 200ms ease',
                    },
                    '&:hover::after': {
                        width: 'calc(100% - 16px)',
                    },
                    // Hover: leve fondo y color de texto
                    transition: 'background-color 150ms ease',
                    '&:hover': {
                        bgcolor: variant.bg,
                    },
                    '&:focus-visible': {
                        outline: `2px solid ${variant.main}`,
                        outlineOffset: 2,
                    },
                }}
            >
                {/* Código de proceso */}
                <Box
                    component="span"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: variant.main,
                        color: '#FFFFFF',
                        px: 0.875,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        minWidth: 32,
                        textAlign: 'center',
                    }}
                >
                    {process.code}
                </Box>

                {/* Nombre del proceso */}
                <Typography
                    component="span"
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        textAlign: 'left',
                        lineHeight: 1.3,
                        transition: 'color 150ms ease',
                        flexGrow: 1,
                        // El hover cambia el color al color del variante del proceso
                        'button:hover &': {
                            color: variant.text,
                        },
                    }}
                >
                    {process.title}
                </Typography>
            </Box>

            <FolderExplorerModal
                open={open}
                onClose={() => setOpen(false)}
                titulo={`${process.code}. ${process.title}`}
                carpetaBase={process.folderPath}
            />
        </>
    );
}