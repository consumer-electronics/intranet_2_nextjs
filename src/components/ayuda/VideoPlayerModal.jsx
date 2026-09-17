'use client';

import { useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';

/**
 * Modal que reproduce un video con el elemento <video> HTML5.
 * Al cerrarse, pausa y limpia el src para liberar memoria.
 *
 * Props:
 *  - open: boolean
 *  - titulo: string
 *  - src: string (URL HTTP del video)
 *  - onClose: () => void
 */
export default function VideoPlayerModal({ open, titulo, src, onClose }) {
    const videoRef = useRef(null);

    // Pausa y limpia el video al cerrar para liberar recursos
    useEffect(() => {
        if (!open && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
            videoRef.current.load();
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="video-modal-titulo"
        >
            <DialogTitle
                id="video-modal-titulo"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pr: 6,
                }}
            >
                <OndemandVideoOutlinedIcon color="primary" fontSize="small" />
                <Typography
                    component="span"
                    variant="h6"
                    noWrap
                    title={titulo}
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    {titulo}
                </Typography>
            </DialogTitle>

            <IconButton
                onClick={onClose}
                aria-label="Cerrar reproductor"
                size="small"
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                {src ? (
                    <Box
                        component="video"
                        ref={videoRef}
                        src={src}
                        controls
                        autoPlay
                        sx={{
                            display: 'block',
                            width: '100%',
                            maxHeight: '70vh',
                            outline: 'none',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ p: 3, color: 'white' }}
                        >
                            Tu navegador no soporta la reproducción de video HTML5.
                        </Typography>
                    </Box>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
