'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';

import FolderExplorerModal from '../info-documentada/FolderExplorerModal';
import { PROCESS_COLOR_VARIANTS } from '@/config/sig/mapaProcesos';
import { useSigPermissions } from '@/hooks/rrhh/sig/useSigPermissions';

/**
 * Botón de proceso del Mapa de Procesos.
 *
 * Refactorizado para usar posicionamiento absoluto drag&drop.
 * - Texto a max 2 líneas.
 * - Tamaño de fuente reducido.
 */
export default function ProcessPalette({ process }) {
    const [open, setOpen] = useState(false);
    const { canViewProcess, loading } = useSigPermissions();

    const variant = PROCESS_COLOR_VARIANTS[process.colorVariant] || PROCESS_COLOR_VARIANTS.orange;

    const handleOpen = () => {
        if (loading) return;
        
        if (canViewProcess(process.code)) {
            setOpen(true);
        }
    };

    return (
        <>
            <Box
                component="button"
                onClick={handleOpen}
                aria-label={`Ver documentos de ${process.title}`}
                sx={{
                    // Reset de estilos de botón nativo
                    appearance: 'none',
                    background: 'none',
                    border: 'none',
                    p: 0,
                    // Layout
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    width: 'auto',
                    maxWidth: { xs: '120px', sm: '160px' }, // Limita el ancho para forzar salto de línea
                    cursor: 'inherit', // Hereda el cursor de DraggableLabel (grab/grabbing/pointer)
                    // Estilo del contenedor
                    py: 0.5,
                    px: 0.5,
                    borderRadius: 1.5,
                    position: 'relative',
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
                {/* Código y Nombre del proceso unificados y centrados */}
                <Typography
                    component="span"
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        // Color permanente de la variante del proceso (naranja, turquesa, etc.)
                        color: variant.text,
                        fontSize: { xs: '0.40rem', sm: '0.6rem', md: '0.65rem', lg: '1rem' },
                        textAlign: 'center',
                        lineHeight: 1.1,
                        transition: 'color 150ms ease',
                        flexGrow: 1,
                        // Limitar a 2 o 3 líneas
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        textOverflow: 'ellipsis',
                        whiteSpace: 'pre-line', // Para respetar saltos de línea manuales (\n)
                    }}
                >
                    {process.code} - {process.title}
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