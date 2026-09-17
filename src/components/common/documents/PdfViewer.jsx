'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import {
    Alert,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1;

function PageSkeleton({ width }) {
    return (
        <Stack spacing={1.5} sx={{ p: 2, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={width} height={Math.round(width * 1.414)} />
        </Stack>
    );
}

function LoadingOverlay() {
    return (
        <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 480, p: 4 }}
        >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
                Cargando documento...
            </Typography>
            <Skeleton variant="rounded" width="min(100%, 640px)" height={360} />
        </Stack>
    );
}

function ErrorState({ message }) {
    return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error" variant="outlined">
                {message || 'No fue posible cargar el documento. Intente abrirlo en una pestaña nueva.'}
            </Alert>
        </Box>
    );
}

/**
 * Visor de documentos PDF global.
 *
 * Props:
 * - src {string}        URL del documento PDF. Requerido.
 * - title {string}      Título opcional (para el botón "abrir en nueva pestaña").
 * - onClose {function}  Si se provee, muestra un botón X de cierre (útil dentro de modales).
 */
export default function PdfViewer({ src, title, onClose }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [pageWidth, setPageWidth] = useState(760);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Responsive: calcula el ancho del contenedor al montar y al redimensionar
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setPageWidth(Math.min(containerRef.current.clientWidth - 40, 960));
            }
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Sincroniza el input de página con el estado
    useEffect(() => {
        setPageInput(String(pageNumber));
    }, [pageNumber]);

    // Escucha cambio de pantalla completa (tecla ESC nativa del navegador)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const onLoadSuccess = useCallback(({ numPages: total }) => {
        setNumPages(total);
        setPageNumber(1);
        setLoadError(null);
    }, []);

    const onLoadError = useCallback((error) => {
        console.error('[PdfViewer] Error cargando documento:', error);
        setLoadError(error?.message || 'Error desconocido al cargar el PDF.');
    }, []);

    const goToPrev = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
    const goToNext = useCallback(
        () => setPageNumber((p) => Math.min(numPages, p + 1)),
        [numPages]
    );

    const handlePageInputChange = (e) => setPageInput(e.target.value);

    const handlePageInputCommit = () => {
        const parsed = parseInt(pageInput, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
            setPageNumber(parsed);
        } else {
            setPageInput(String(pageNumber));
        }
    };

    const handlePageInputKeyDown = (e) => {
        if (e.key === 'Enter') handlePageInputCommit();
    };

    const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))), []);
    const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2))), []);
    const resetZoom = useCallback(() => setZoom(DEFAULT_ZOOM), []);

    const toggleFullscreen = useCallback(async () => {
        if (!viewerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await viewerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // Silenciar errores de permisos de fullscreen
        }
    }, []);

    const effectiveWidth = Math.max(280, Math.round(pageWidth * zoom));

    return (
        <Box
            ref={viewerRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: isFullscreen ? '#1a1a1a' : 'background.default',
                height: isFullscreen ? '100vh' : '100%',
                overflow: 'hidden',
            }}
        >
            {/* ── Barra de herramientas superior ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.75,
                    bgcolor: isFullscreen ? '#2a2a2a' : 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: isFullscreen ? 'rgba(255,255,255,0.12)' : 'divider',
                    flexWrap: 'wrap',
                    rowGap: 0.5,
                    flexShrink: 0,
                }}
            >
                {/* Título */}
                {title && (
                    <>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{
                                flexGrow: 1,
                                minWidth: 0,
                                color: isFullscreen ? '#fff' : 'text.primary',
                                fontSize: '0.8125rem',
                            }}
                        >
                            {title}
                        </Typography>
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.5, borderColor: isFullscreen ? 'rgba(255,255,255,0.15)' : 'divider' }}
                        />
                    </>
                )}

                {/* Zoom */}
                <Tooltip title="Reducir zoom">
                    <span>
                        <IconButton
                            size="small"
                            onClick={zoomOut}
                            disabled={zoom <= MIN_ZOOM}
                            sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                        >
                            <ZoomOutIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Restablecer zoom (100%)">
                    <Typography
                        component="button"
                        onClick={resetZoom}
                        variant="caption"
                        sx={{
                            minWidth: 44,
                            textAlign: 'center',
                            fontWeight: 600,
                            px: 0.75,
                            py: 0.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: isFullscreen ? 'rgba(255,255,255,0.2)' : 'divider',
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            color: isFullscreen ? '#fff' : 'text.primary',
                            transition: 'background-color 150ms ease',
                            '&:hover': {
                                bgcolor: isFullscreen ? 'rgba(255,255,255,0.08)' : 'action.hover',
                            },
                        }}
                    >
                        {Math.round(zoom * 100)}%
                    </Typography>
                </Tooltip>

                <Tooltip title="Aumentar zoom">
                    <span>
                        <IconButton
                            size="small"
                            onClick={zoomIn}
                            disabled={zoom >= MAX_ZOOM}
                            sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                        >
                            <ZoomInIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Ajustar al ancho">
                    <IconButton
                        size="small"
                        onClick={resetZoom}
                        sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                    >
                        <ZoomOutMapIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 0.5, borderColor: isFullscreen ? 'rgba(255,255,255,0.15)' : 'divider' }}
                />

                {/* Navegación de páginas */}
                <Tooltip title="Página anterior">
                    <span>
                        <IconButton
                            size="small"
                            onClick={goToPrev}
                            disabled={pageNumber <= 1}
                            aria-label="Página anterior"
                            sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                        >
                            <NavigateBeforeIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TextField
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputCommit}
                        onKeyDown={handlePageInputKeyDown}
                        size="small"
                        slotProps={{
                            input: {
                                sx: {
                                    width: 48,
                                    textAlign: 'center',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    bgcolor: isFullscreen ? 'rgba(255,255,255,0.08)' : undefined,
                                    color: isFullscreen ? '#fff' : undefined,
                                    '& input': { textAlign: 'center', p: '4px 6px' },
                                },
                            },
                        }}
                        sx={{ width: 52 }}
                        aria-label="Número de página"
                    />
                    {numPages > 0 && (
                        <Typography
                            variant="caption"
                            sx={{ color: isFullscreen ? 'grey.400' : 'text.secondary', whiteSpace: 'nowrap' }}
                        >
                            / {numPages}
                        </Typography>
                    )}
                </Stack>

                <Tooltip title="Página siguiente">
                    <span>
                        <IconButton
                            size="small"
                            onClick={goToNext}
                            disabled={!numPages || pageNumber >= numPages}
                            aria-label="Página siguiente"
                            sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                        >
                            <NavigateNextIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Box sx={{ flexGrow: 1 }} />

                {/* Acciones secundarias */}
                {src && (
                    <Tooltip title="Abrir en pestaña nueva">
                        <IconButton
                            size="small"
                            component="a"
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Abrir en pestaña nueva"
                            sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                    <IconButton
                        size="small"
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                    >
                        {isFullscreen ? (
                            <FullscreenExitIcon fontSize="small" />
                        ) : (
                            <FullscreenIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>

                {onClose && (
                    <>
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 0.5, borderColor: isFullscreen ? 'rgba(255,255,255,0.15)' : 'divider' }}
                        />
                        <Tooltip title="Cerrar">
                            <IconButton
                                size="small"
                                onClick={onClose}
                                aria-label="Cerrar visor"
                                sx={{ color: isFullscreen ? 'grey.300' : undefined }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Box>

            {/* ── Área del documento ── */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: isFullscreen ? '#1a1a1a' : 'grey.100',
                    p: { xs: 1, sm: 2 },
                }}
            >
                {src ? (
                    <Document
                        file={src}
                        loading={<LoadingOverlay />}
                        error={
                            loadError ? (
                                <ErrorState message={loadError} />
                            ) : (
                                <ErrorState />
                            )
                        }
                        onLoadSuccess={onLoadSuccess}
                        onLoadError={onLoadError}
                    >
                        <Box
                            sx={{
                                boxShadow: isFullscreen
                                    ? '0 4px 24px rgba(0,0,0,0.6)'
                                    : '0 2px 12px rgba(0,0,0,0.12)',
                                bgcolor: '#fff',
                                display: 'inline-block',
                            }}
                        >
                            <Page
                                pageNumber={pageNumber}
                                width={effectiveWidth}
                                loading={<PageSkeleton width={effectiveWidth} />}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Box>
                    </Document>
                ) : (
                    <Box sx={{ p: 4 }}>
                        <Alert severity="warning" variant="outlined">
                            No se ha especificado un documento para mostrar.
                        </Alert>
                    </Box>
                )}
            </Box>
        </Box>
    );
}