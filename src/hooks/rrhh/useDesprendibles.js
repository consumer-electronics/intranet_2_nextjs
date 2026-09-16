'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/utils/Fetchclient';

export function useDesprendibles() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch('/api/rrhh/desprendibles');
            setFiles(res?.data?.files ?? res?.files ?? []);
        } catch (err) {
            setError(err instanceof ApiError ? err.payload?.message ?? err.message : 'Error al cargar los desprendibles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const openPreview = useCallback(async (file) => {
        setSelectedFile(file);
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/rrhh/desprendibles/download?id=${encodeURIComponent(file.doc)}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('No se pudo obtener el documento');
            const blob = await res.blob();
            setPreviewUrl(URL.createObjectURL(blob));
        } catch {
            setError('No se pudo cargar la vista previa del documento');
            setSelectedFile(null);
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    const closePreview = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
    }, [previewUrl]);

    const downloadFile = useCallback(async (file) => {
        try {
            const res = await fetch(
                `/api/rrhh/desprendibles/download?id=${encodeURIComponent(file.doc)}&download=true`,
                { credentials: 'include' }
            );
            if (!res.ok) throw new Error('No se pudo descargar el documento');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.doc;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            setError('No se pudo descargar el documento');
        }
    }, []);

    return {
        files,
        loading,
        error,
        selectedFile,
        previewUrl,
        previewLoading,
        openPreview,
        closePreview,
        downloadFile,
        refetch: fetchFiles,
    };
}