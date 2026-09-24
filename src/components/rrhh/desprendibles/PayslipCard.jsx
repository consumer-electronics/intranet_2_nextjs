'use client';

import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/**
 * Tarjeta de desprendible de nómina.
 *
 * - Clic en el área principal (nombre / fecha) → onSelect → abre el modal de previsualización.
 * - Clic en el botón de descarga (ícono) → onDownload → descarga directa sin abrir el modal.
 */
export default function PayslipCard({ file, isLatest, onSelect, onDownload }) {
    return (
        <Card
            variant="outlined"
            sx={{
                display: 'flex',
                alignItems: 'center',
                // El botón de descarga ocupa su propio espacio a la derecha
                pr: 0.5,
                transition: 'border-color 150ms ease',
                '&:hover': { borderColor: 'primary.main' },
            }}
        >
            {/* ── Área clickeable principal → abre modal ── */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                onClick={onSelect}
                sx={{
                    flex: 1,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    minWidth: 0,
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <PictureAsPdfIcon color="error" sx={{ flexShrink: 0 }} />
                    <Typography noWrap>{file.doc}</Typography>
                    {isLatest && <Chip label="Último" size="small" color="primary" />}
                </Stack>
                <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                    {file.date}
                </Typography>
            </Stack>

            {/* ── Botón de descarga directa ── */}
            <Tooltip title="Descargar" placement="left">
                <IconButton
                    onClick={(e) => {
                        // Evitar que el clic se propague al área principal
                        e.stopPropagation();
                        onDownload();
                    }}
                    size="medium"
                    color="primary"
                    aria-label={`Descargar ${file.doc}`}
                    sx={{ mx: 0.5, flexShrink: 0 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Tooltip>
        </Card>
    );
}