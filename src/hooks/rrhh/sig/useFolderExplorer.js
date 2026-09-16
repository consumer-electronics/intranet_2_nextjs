'use client';

import { useEffect, useState } from 'react';

import { fetchEstructuraGeneral } from '@/api/sig/infoDocumentada';

import useDebouncedValue from './useDebouncedValue';

/**
 * Encapsula: fetch del árbol (según carpetaBase + búsqueda), estado de
 * búsqueda y estado de navegación por breadcrumbs (path).
 *
 * La navegación por carpetas es 100% client-side (no vuelve a pegarle al
 * backend): el árbol completo ya viene en la respuesta, solo cambiamos
 * qué nivel mostramos.
 */
export default function useFolderExplorer({ carpetaBase, active = true } = {}) {
    const [busqueda, setBusqueda] = useState('');
    const [path, setPath] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const busquedaDebounced = useDebouncedValue(busqueda, 400);
    const enBusqueda = Boolean(busquedaDebounced.trim());

    // Reinicia navegación/búsqueda cada vez que se activa el panel o cambia la raíz
    useEffect(() => {
        if (active) {
            setPath([]);
            setBusqueda('');
        }
    }, [active, carpetaBase]);

    useEffect(() => {
        if (!active) return undefined;

        let vivo = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const { data: respuesta } = await fetchEstructuraGeneral(busquedaDebounced, carpetaBase);
                if (vivo) setData(respuesta ?? []);
            } catch (err) {
                if (vivo) setError(err.message || 'No se pudo cargar la información.');
            } finally {
                if (vivo) setLoading(false);
            }
        })();

        return () => {
            vivo = false;
        };
    }, [active, busquedaDebounced, carpetaBase]);

    return { busqueda, setBusqueda, path, setPath, data, loading, error, enBusqueda };
}