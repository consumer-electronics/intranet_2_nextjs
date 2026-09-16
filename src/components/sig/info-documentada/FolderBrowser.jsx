'use client';

import { useMemo, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SearchIcon from '@mui/icons-material/Search';
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

import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import useFolderExplorer from '@/hooks/rrhh/sig/useFolderExplorer';
import { aplanarArchivos, esPdf, normalizarNivel, obtenerNivelEnRuta } from '@/utils/rrhh/sig/folderTree';
import { construirRutaBase, construirUrlArchivo } from '@/utils/rrhh/sig/documentUrl';

/**
 * Explorador de carpetas reutilizable: breadcrumbs + grid de carpetas/archivos
 * cuando no hay búsqueda activa, y lista de resultados aplanados (con ruta)
 * cuando sí la hay. Se usa tanto inline (pestaña "Documentos generales")
 * como dentro de un Dialog (FolderExplorerModal, desde el Mapa de procesos).
 */
export default function FolderBrowser({ carpetaBase, tituloRaiz = 'Documentos generales', active = true }) {
    const { busqueda, setBusqueda, path, setPath, data, loading, error, enBusqueda } = useFolderExplorer({
        carpetaBase,
        active,
    });

    const [documentoActivo, setDocumentoActivo] = useState(null);

    const rutaBase = useMemo(() => construirRutaBase(carpetaBase), [carpetaBase]);

    const nivelActual = useMemo(() => {
        if (enBusqueda) return null;
        return obtenerNivelEnRuta(data, path);
    }, [data, path, enBusqueda]);

    const { carpetas, archivos } = useMemo(() => normalizarNivel(nivelActual), [nivelActual]);

    const resultadosBusqueda = useMemo(() => {
        if (!enBusqueda) return [];
        return aplanarArchivos(data);
    }, [data, enBusqueda]);

    const abrirArchivo = (archivo, rutaCarpetas) => {
        const url = construirUrlArchivo(rutaBase, rutaCarpetas, archivo);
        if (esPdf(archivo)) {
            setDocumentoActivo({ label: archivo.replace(/_/g, ' '), file: url });
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const irACarpeta = (nombre) => setPath((prev) => [...prev, nombre]);
    const irABreadcrumb = (index) => setPath((prev) => prev.slice(0, index));

    return (
        <Stack spacing={2.5}>
            <TextField
                fullWidth
                size="small"
                placeholder="Buscar documento por nombre..."
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
                                <IconButton size="small" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    },
                }}
            />

            {!enBusqueda && (
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <MuiLink
                        component="button"
                        underline={path.length ? 'hover' : 'none'}
                        color={path.length ? 'primary' : 'text.primary'}
                        onClick={() => irABreadcrumb(0)}
                        sx={{ fontWeight: path.length ? 400 : 700 }}
                    >
                        {tituloRaiz}
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

            {loading && (
                <Grid container spacing={1.5}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rounded" height={64} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!loading && !error && enBusqueda && (
                <ResultadosBusqueda resultados={resultadosBusqueda} termino={busqueda} onAbrirArchivo={abrirArchivo} />
            )}

            {!loading && !error && !enBusqueda && (
                <NivelCarpeta
                    carpetas={carpetas}
                    archivos={archivos}
                    onAbrirCarpeta={irACarpeta}
                    onAbrirArchivo={(archivo) => abrirArchivo(archivo, path)}
                />
            )}

            <PdfViewerModal
                open={Boolean(documentoActivo)}
                titulo={documentoActivo?.label}
                src={documentoActivo?.file}
                onClose={() => setDocumentoActivo(null)}
            />
        </Stack>
    );
}

function NivelCarpeta({ carpetas, archivos, onAbrirCarpeta, onAbrirArchivo }) {
    if (carpetas.length === 0 && archivos.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <Typography color="text.secondary">Esta carpeta no tiene contenido.</Typography>
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

            {archivos.map((archivo) => (
                <Grid key={archivo.archivo} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                        variant="outlined"
                        onClick={() => onAbrirArchivo(archivo.archivo)}
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
                        {esPdf(archivo.archivo) ? (
                            <PictureAsPdfOutlinedIcon color="error" />
                        ) : (
                            <DescriptionOutlinedIcon color="action" />
                        )}
                        <Typography variant="body2" noWrap>
                            {archivo.archivo.replace(/_/g, ' ')}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

function ResultadosBusqueda({ resultados, termino, onAbrirArchivo }) {
    if (resultados.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                <Stack spacing={1} alignItems="center">
                    <SearchIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography color="text.secondary">
                        No se encontraron documentos para <strong>&ldquo;{termino}&rdquo;</strong>
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
                    key={`${item.archivo}-${index}`}
                    variant="outlined"
                    onClick={() => onAbrirArchivo(item.archivo, item.rutaCarpetas)}
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
                    {esPdf(item.archivo) ? (
                        <PictureAsPdfOutlinedIcon color="error" />
                    ) : (
                        <DescriptionOutlinedIcon color="action" />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                            {item.archivo.replace(/_/g, ' ')}
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