'use client';

import { useEffect, useState } from 'react';

import { fetchEstructuraGeneral } from '@/api/sig/infoDocumentada';

import useDebouncedValue from './useDebouncedValue';

/**
 * Encapsula: fetch del árbol (según carpetaBase + búsqueda) y estado de
 * búsqueda.
 *
 * La navegación por carpetas es 100% client-side (no vuelve a pegarle al
 * backend): el árbol completo ya viene en la respuesta, lo mostramos
 * como un árbol expandible.
 */
export default function useFolderExplorer({ carpetaBase, active = true, soloGenerales = false } = {}) {
    const [busqueda, setBusqueda] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const busquedaDebounced = useDebouncedValue(busqueda, 400);
    const enBusqueda = Boolean(busquedaDebounced.trim());

    // Reinicia búsqueda cada vez que se activa el panel o cambia la raíz
    useEffect(() => {
        if (active) {
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
                const { data: respuesta } = await fetchEstructuraGeneral(busquedaDebounced, carpetaBase, soloGenerales);
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
    }, [active, busquedaDebounced, carpetaBase, soloGenerales]);

    return { busqueda, setBusqueda, data, loading, error, enBusqueda };
}