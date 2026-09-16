'use client';

import { useMemo, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import {
    Alert,
    Box,
    Breadcrumbs,
    Grid,
    IconButton,
    InputAdornment,
    Link as MuiLink,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import VideoPlayerModal from './VideoPlayerModal';

import useVideoExplorer from '@/hooks/ayuda/useVideoExplorer';
import { aplanarVideos, esVideoSoportado, normalizarNivel, obtenerNivelEnRuta } from '@/utils/ayuda/videoTree';

/** URL base HTTP para construir la URL de cada video */
const VIDEOS_BASE_URL = process.env.NEXT_PUBLIC_AYUDA_VIDEOS_BASE_URL || '';

function construirUrlVideo(path, nombreVideo) {
    const segmentos = [...path.map(encodeURIComponent), encodeURIComponent(nombreVideo)];
    return `${VIDEOS_BASE_URL}/${segmentos.join('/')}`;
}

/**
 * Explorador de carpetas de videos de ayuda:
 * breadcrumbs + grid de carpetas/videos cuando no hay búsqueda activa,
 * y lista de resultados aplanados cuando sí la hay.
 */
export default function VideoBrowser({ active = true }) {
    const { busqueda, setBusqueda, path, setPath, data, loading, error, enBusqueda } =
        useVideoExplorer({ active });

    const [videoActivo, setVideoActivo] = useState(null);

    const nivelActual = useMemo(() => {
        if (enBusqueda) return null;
        return obtenerNivelEnRuta(data, path);
    }, [data, path, enBusqueda]);

    const { carpetas, videos } = useMemo(() => normalizarNivel(nivelActual), [nivelActual]);

    const resultadosBusqueda = useMemo(() => {
        if (!enBusqueda) return [];
        return aplanarVideos(data);
    }, [data, enBusqueda]);

    const abrirVideo = (nombreVideo, rutaCarpetas) => {
        const url = construirUrlVideo(rutaCarpetas, nombreVideo);
        setVideoActivo({ label: nombreVideo.replace(/_/g, ' '), src: url });
    };

    const irACarpeta = (nombre) => setPath((prev) => [...prev, nombre]);
    const irABreadcrumb = (index) => setPath((prev) => prev.slice(0, index));

    return (
        <Stack spacing={2.5}>
            {/* Buscador */}
            <TextField
                fullWidth
                size="small"
                placeholder="Buscar video por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: busqueda ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setBusqueda('')}
                                    aria-label="Limpiar búsqueda"
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    },
                }}
            />

            {/* Breadcrumbs */}
            {!enBusqueda && (
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <MuiLink
                        component="button"
                        underline={path.length ? 'hover' : 'none'}
                        color={path.length ? 'primary' : 'text.primary'}
                        onClick={() => irABreadcrumb(0)}
                        sx={{ fontWeight: path.length ? 400 : 700 }}
                    >
                        Videos instructivos
                    </MuiLink>
                    {path.map((nombre, index) => (
                        <MuiLink
                            key={`${nombre}-${index}`}
                            component="button"
                            underline={index === path.length - 1 ? 'none' : 'hover'}
                            color={index === path.length - 1 ? 'text.primary' : 'primary'}
                            onClick={() => irABreadcrumb(index + 1)}
                            sx={{ fontWeight: index === path.length - 1 ? 700 : 400 }}
                        >
                            {nombre}
                        </MuiLink>
                    ))}
                </Breadcrumbs>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {/* Skeletons */}
            {loading && (
                <Grid container spacing={1.5}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rounded" height={64} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Resultados de búsqueda */}
            {!loading && !error && enBusqueda && (
                <ResultadosBusqueda
                    resultados={resultadosBusqueda}
                    termino={busqueda}
                    onAbrirVideo={abrirVideo}
                />
            )}

            {/* Nivel actual */}
            {!loading && !error && !enBusqueda && (
                <NivelCarpeta
                    carpetas={carpetas}
                    videos={videos}
                    onAbrirCarpeta={irACarpeta}
                    onAbrirVideo={(nombreVideo) => abrirVideo(nombreVideo, path)}
                />
            )}

            {/* Modal reproductor */}
            <VideoPlayerModal
                open={Boolean(videoActivo)}
                titulo={videoActivo?.label}
                src={videoActivo?.src}
                onClose={() => setVideoActivo(null)}
            />
        </Stack>
    );
}

// ─── Componentes internos ────────────────────────────────────────────────────

function NivelCarpeta({ carpetas, videos, onAbrirCarpeta, onAbrirVideo }) {
    if (carpetas.length === 0 && videos.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <Stack spacing={1} alignItems="center">
                    <VideocamOffOutlinedIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography color="text.secondary">Esta carpeta no contiene videos.</Typography>
                </Stack>
            </Paper>
        );
    }

    return (
        <Grid container spacing={1.5}>
            {carpetas.map((carpeta) => (
                <Grid key={carpeta.nombre} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                        variant="outlined"
                        onClick={() => onAbrirCarpeta(carpeta.nombre)}
                        sx={{
                            p: 1.75,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            cursor: 'pointer',
                            borderRadius: 2,
                            transition: 'border-color 150ms ease, background-color 150ms ease',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                        }}
                    >
                        <FolderOutlinedIcon color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {carpeta.nombre}
                        </Typography>
                    </Paper>
                </Grid>
            ))}

            {videos.map((item) => (
                <Grid key={item.video} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                        variant="outlined"
                        onClick={() => onAbrirVideo(item.video)}
                        sx={{
                            p: 1.75,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            cursor: 'pointer',
                            borderRadius: 2,
                            transition: 'border-color 150ms ease, background-color 150ms ease',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                        }}
                    >
                        <OndemandVideoOutlinedIcon
                            color={esVideoSoportado(item.video) ? 'primary' : 'action'}
                        />
                        <Typography variant="body2" noWrap>
                            {item.video.replace(/_/g, ' ')}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

function ResultadosBusqueda({ resultados, termino, onAbrirVideo }) {
    if (resultados.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <Stack spacing={1} alignItems="center">
                    <SearchIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography color="text.secondary">
                        No se encontraron videos para <strong>&ldquo;{termino}&rdquo;</strong>
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    return (
        <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </Typography>
            {resultados.map((item, index) => (
                <Paper
                    key={`${item.video}-${index}`}
                    variant="outlined"
                    onClick={() => onAbrirVideo(item.video, item.rutaCarpetas)}
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        borderRadius: 2,
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                    }}
                >
                    <OndemandVideoOutlinedIcon
                        color={esVideoSoportado(item.video) ? 'primary' : 'action'}
                    />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                            {item.video.replace(/_/g, ' ')}
                        </Typography>
                        {item.rutaCarpetas.length > 0 && (
                            <Typography variant="caption" color="text.secondary" noWrap component="div">
                                {item.rutaCarpetas.join(' / ')}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            ))}
        </Stack>
    );
}
