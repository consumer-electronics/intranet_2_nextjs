'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/utils/Fetchclient';
import {
    checkPermisoCertificados,
    getListaCertificados,
} from '@/api/rrhh/certificadosLaborales';

// Caché en memoria a nivel de módulo del listado de funcionarios. Al volver a
// entrar al módulo (remontaje del componente) se reutilizan las filas ya
// cargadas si el caché sigue vigente, evitando una petición de red y haciendo
// la navegación/búsqueda mucho más rápida.
const LISTA_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
let listaCache = {
    timestamp: 0,
    rows: null,
};

/**
 * Hook central del módulo "Certificados Laborales".
 *
 * Orquesta:
 *  - La verificación de permiso del módulo (certificados_laborales).
 *  - La carga del listado de funcionarios activos (vrol).
 *  - La generación/vista previa del certificado PDF de un funcionario.
 *
 * @param {number|string} funId - id del funcionario autenticado (fun_id).
 */
export function useCertificadosLaborales(funId) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Permiso del módulo
    const [granted, setGranted] = useState(false);
    const [loadingPermiso, setLoadingPermiso] = useState(true);

    // Vista previa del certificado PDF
    const [selectedRow, setSelectedRow] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Snackbar de retroalimentación
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const closeSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    // Verificación de permiso
    useEffect(() => {
        let active = true;

        async function loadPermiso() {
            // Aún no hay usuario autenticado (funId null): mantenemos el estado
            // de carga para evitar mostrar "Acceso no autorizado" de forma
            // momentánea mientras useAuth resuelve la identidad.
            if (!funId) {
                return;
            }
            try {
                const res = await checkPermisoCertificados(funId, 'certificados_laborales');
                if (active) setGranted(Boolean(res?.granted));
            } catch {
                if (active) setGranted(false);
            } finally {
                if (active) setLoadingPermiso(false);
            }
        }

        loadPermiso();
        return () => {
            active = false;
        };
    }, [funId]);

    // Carga del listado de funcionarios. Si el caché en memoria sigue vigente
    // se reutiliza (respuesta instantánea al volver al módulo); con force=true
    // se ignora el caché y se consulta de nuevo al servidor.
    const fetchLista = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && listaCache.rows && now - listaCache.timestamp < LISTA_CACHE_TTL_MS) {
            setRows(listaCache.rows);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await getListaCertificados();
            const nextRows = res?.data?.rows ?? res?.rows ?? [];
            listaCache = { timestamp: Date.now(), rows: nextRows };
            setRows(nextRows);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.payload?.message ?? err.message
                    : 'Error al cargar el listado de certificados laborales'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (granted) {
            fetchLista();
        }
    }, [granted, fetchLista]);

    /**
     * Genera y abre la vista previa del certificado laboral de un funcionario.
     * Se obtiene el binario del PDF desde la ruta interna y se convierte a
     * un Blob URL para que el visor general (PdfViewer) pueda mostrarlo.
     */
    const openPreview = useCallback(async (row) => {
        setSelectedRow(row);
        setPreviewLoading(true);
        try {
            const res = await fetch(
                `/api/rrhh/certificados-laborales/pdf?id=${encodeURIComponent(row.fun_id)}`,
                { credentials: 'include' }
            );
            if (!res.ok) throw new Error('No se pudo generar el certificado laboral');
            const blob = await res.blob();
            setPreviewUrl(URL.createObjectURL(blob));
        } catch {
            setError('No se pudo generar el certificado laboral');
            setSelectedRow(null);
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    const closePreview = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedRow(null);
    }, [previewUrl]);

    /**
     * Descarga el certificado laboral de un funcionario como archivo PDF.
     */
    const downloadPdf = useCallback(async (row) => {
        try {
            const res = await fetch(
                `/api/rrhh/certificados-laborales/pdf?id=${encodeURIComponent(row.fun_id)}`,
                { credentials: 'include' }
            );
            if (!res.ok) throw new Error('No se pudo descargar el certificado laboral');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificado_laboral_${row.fun_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showSnackbar('Certificado laboral descargado correctamente', 'success');
        } catch {
            showSnackbar('No se pudo descargar el certificado laboral', 'error');
        }
    }, [showSnackbar]);

    return {
        rows,
        loading,
        error,
        granted,
        loadingPermiso,
        selectedRow,
        previewUrl,
        previewLoading,
        openPreview,
        closePreview,
        downloadPdf,
        snackbar,
        showSnackbar,
        closeSnackbar,
        // refetch fuerza una consulta nueva (ignora el caché en memoria).
        refetch: () => fetchLista(true),
    };
}
