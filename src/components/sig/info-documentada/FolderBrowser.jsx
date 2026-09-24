'use client';

import { useMemo, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
    Alert,
    Box,
    Collapse,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import PdfViewerModal from '@/components/common/documents/PdfViewerModal';

import useFolderExplorer from '@/hooks/rrhh/sig/useFolderExplorer';
import { aplanarArchivos, esPdf, normalizarNivel } from '@/utils/rrhh/sig/folderTree';
import { construirRutaBase, construirUrlArchivo } from '@/utils/rrhh/sig/documentUrl';
import { useSigPermissions } from '@/hooks/rrhh/sig/useSigPermissions';
import { FOLDER_PERMISSION_MAP } from '@/config/sig/permissions';

/**
 * Explorador de carpetas reutilizable con árbol expandible inline.
 * Las carpetas se abren hacia abajo en la misma vista (sin breadcrumbs ni
 * cambio de vista). Se usa tanto inline (pestaña "Documentos generales")
 * como dentro de un Dialog (FolderExplorerModal, desde el Mapa de procesos).
 */
export default function FolderBrowser({ carpetaBase, tituloRaiz = 'Documentos generales', active = true, soloGenerales = false }) {
    const { busqueda, setBusqueda, data, loading, error, enBusqueda } = useFolderExplorer({
        carpetaBase,
        active,
        soloGenerales,
    });

    const { canView } = useSigPermissions();

    const [documentoActivo, setDocumentoActivo] = useState(null);

    const rutaBase = useMemo(() => construirRutaBase(carpetaBase), [carpetaBase]);

    /**
     * Filtra las carpetas de un nivel aplicando el mapa de permisos.
     */
    const filtrarCarpetas = (carpetas) =>
        carpetas.filter((carpeta) => {
            const nombreLimpio = carpeta.nombre.replace(/^\d+\.\s*/, '').trim();
            const permisoRequerido = FOLDER_PERMISSION_MAP[nombreLimpio];
            return permisoRequerido ? canView(permisoRequerido) : true;
        });

    const resultadosBusqueda = useMemo(() => {
        if (!enBusqueda) return [];
        const resultados = aplanarArchivos(data);
        return resultados.filter((item) =>
            item.rutaCarpetas.every((carpeta) => {
                const nombreLimpio = carpeta.replace(/^\d+\.\s*/, '').trim();
                const permisoRequerido = FOLDER_PERMISSION_MAP[nombreLimpio];
                return permisoRequerido ? canView(permisoRequerido) : true;
            })
        );
    }, [data, enBusqueda, canView]);

    const abrirArchivo = (archivo, rutaCarpetas) => {
        const url = construirUrlArchivo(rutaBase, rutaCarpetas, archivo);
        if (esPdf(archivo)) {
            setDocumentoActivo({ label: archivo.replace(/_/g, ' '), file: url });
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

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

            {error && <Alert severity="error">{error}</Alert>}

            {loading && (
                <Stack spacing={1}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={46} />
                    ))}
                </Stack>
            )}

            {!loading && !error && enBusqueda && (
                <ResultadosBusqueda resultados={resultadosBusqueda} termino={busqueda} onAbrirArchivo={abrirArchivo} />
            )}

            {!loading && !error && !enBusqueda && (
                <ArbolCarpeta
                    contenido={data}
                    rutaCarpetas={[]}
                    filtrarCarpetas={filtrarCarpetas}
                    onAbrirArchivo={abrirArchivo}
                    nivel={0}
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

/**
 * Nodo recursivo del árbol. Renderiza las carpetas (expandibles) y archivos
 * del nivel recibido. Las sub-carpetas usan el mismo componente de forma recursiva.
 */
function ArbolCarpeta({ contenido, rutaCarpetas, filtrarCarpetas, onAbrirArchivo, nivel = 0, inicialmenteAbierto = false }) {
    const { carpetas, archivos } = normalizarNivel(contenido);
    const carpetasFiltradas = filtrarCarpetas(carpetas);

    if (carpetasFiltradas.length === 0 && archivos.length === 0) {
        return (
            <Box sx={{ pl: nivel * 2.5 }}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                    <Typography color="text.secondary" variant="body2">
                        Esta carpeta no tiene contenido.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Stack spacing={0.5} sx={{ pl: nivel > 0 ? 2.5 : 0 }}>
            {carpetasFiltradas.map((carpeta) => (
                <CarpetaItem
                    key={carpeta.nombre}
                    carpeta={carpeta}
                    rutaCarpetas={rutaCarpetas}
                    filtrarCarpetas={filtrarCarpetas}
                    onAbrirArchivo={onAbrirArchivo}
                    nivel={nivel}
                    inicialmenteAbierto={inicialmenteAbierto && nivel === 0}
                />
            ))}

            {archivos.map((archivo) => (
                <ArchivoItem
                    key={archivo.archivo}
                    archivo={archivo.archivo}
                    rutaCarpetas={rutaCarpetas}
                    onAbrirArchivo={onAbrirArchivo}
                    nivel={nivel}
                />
            ))}
        </Stack>
    );
}

/**
 * Fila de carpeta con toggle de expansión.
 */
function CarpetaItem({ carpeta, rutaCarpetas, filtrarCarpetas, onAbrirArchivo, nivel, inicialmenteAbierto }) {
    const [abierta, setAbierta] = useState(inicialmenteAbierto);
    const rutaHija = [...rutaCarpetas, carpeta.nombre];

    return (
        <Box>
            <Paper
                variant="outlined"
                onClick={() => setAbierta((prev) => !prev)}
                sx={{
                    px: 1.75,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    cursor: 'pointer',
                    borderRadius: 2,
                    bgcolor: abierta ? 'action.selected' : 'background.paper',
                    transition: 'border-color 150ms ease, background-color 150ms ease',
                    '&:hover': { borderColor: 'primary.main', bgcolor: abierta ? 'action.selected' : 'action.hover' },
                    // Indentación visual por nivel (borde izquierdo de color)
                    ...(nivel > 0 && {
                        borderLeft: '3px solid',
                        borderLeftColor: abierta ? 'primary.main' : 'divider',
                    }),
                }}
            >
                {abierta ? (
                    <FolderOpenOutlinedIcon color="primary" sx={{ flexShrink: 0 }} />
                ) : (
                    <FolderOutlinedIcon color="primary" sx={{ flexShrink: 0 }} />
                )}
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}
                >
                    {carpeta.nombre}
                </Typography>
                {abierta ? (
                    <ExpandLessIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                ) : (
                    <ExpandMoreIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                )}
            </Paper>

            <Collapse in={abierta} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 0.5, mb: 0.5 }}>
                    <ArbolCarpeta
                        contenido={carpeta.contenido}
                        rutaCarpetas={rutaHija}
                        filtrarCarpetas={filtrarCarpetas}
                        onAbrirArchivo={onAbrirArchivo}
                        nivel={nivel + 1}
                    />
                </Box>
            </Collapse>
        </Box>
    );
}

/**
 * Fila de archivo con icono según extensión.
 */
function ArchivoItem({ archivo, rutaCarpetas, onAbrirArchivo, nivel }) {
    return (
        <Paper
            variant="outlined"
            onClick={() => onAbrirArchivo(archivo, rutaCarpetas)}
            sx={{
                px: 1.75,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'border-color 150ms ease, background-color 150ms ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                ...(nivel > 0 && {
                    borderLeft: '3px solid',
                    borderLeftColor: 'divider',
                }),
            }}
        >
            {esPdf(archivo) ? (
                <PictureAsPdfOutlinedIcon color="error" sx={{ flexShrink: 0 }} />
            ) : (
                <DescriptionOutlinedIcon color="action" sx={{ flexShrink: 0 }} />
            )}
            <Typography variant="body2" sx={{ minWidth: 0 }}>
                {archivo.replace(/_/g, ' ')}
            </Typography>
        </Paper>
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