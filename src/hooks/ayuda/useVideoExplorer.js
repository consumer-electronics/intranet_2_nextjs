'use client';

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react';

import { fetchEstructuraVideos } from '@/api/ayuda/videos';
import useDebouncedValue from '@/hooks/rrhh/sig/useDebouncedValue';

const initialState = {
    busqueda: '',
    path: [],
    data: [],
    loading: false,
    error: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_BUSQUEDA':
            return { ...state, busqueda: action.payload };
        case 'SET_PATH':
            return { ...state, path: action.payload };
        case 'RESET_NAV':
            return { ...state, path: [], busqueda: '' };
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, data: action.payload, loading: false };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

/**
 * Encapsula: fetch del árbol de videos (según búsqueda), estado de
 * búsqueda y estado de navegación por breadcrumbs (path).
 *
 * La navegación por carpetas es 100% client-side: el árbol completo
 * viene en la respuesta, solo cambiamos qué nivel mostramos.
 */
export default function useVideoExplorer({ active = true } = {}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { busqueda, path, data, loading, error } = state;

    // Ref para acceder al path actual en callbacks sin recrearlos.
    // Se sincroniza en useLayoutEffect para no actualizar durante el render.
    const pathRef = useRef(path);
    useLayoutEffect(() => {
        pathRef.current = path;
    });

    const busquedaDebounced = useDebouncedValue(busqueda, 400);
    const enBusqueda = Boolean(busquedaDebounced.trim());

    const setBusqueda = useCallback(
        (value) => dispatch({ type: 'SET_BUSQUEDA', payload: value }),
        []
    );

    // setPath acepta valor directo o función actualizadora (mismo contrato que useState)
    const setPath = useCallback((updater) => {
        const nextPath =
            typeof updater === 'function' ? updater(pathRef.current) : updater;
        dispatch({ type: 'SET_PATH', payload: nextPath });
    }, []);

    // Reinicia navegación/búsqueda cuando el panel se activa.
    // Promise.resolve evita setState síncrono en el cuerpo del efecto.
    useEffect(() => {
        if (!active) return;
        Promise.resolve().then(() => dispatch({ type: 'RESET_NAV' }));
    }, [active]);

    // Fetch del árbol de videos
    useEffect(() => {
        if (!active) return undefined;

        let vivo = true;

        (async () => {
            // Microtask: los dispatches ocurren fuera del cuerpo síncrono del efecto
            await Promise.resolve();
            if (!vivo) return;

            dispatch({ type: 'FETCH_START' });

            try {
                const { data: respuesta } = await fetchEstructuraVideos(busquedaDebounced);
                if (vivo) dispatch({ type: 'FETCH_SUCCESS', payload: respuesta ?? [] });
            } catch (err) {
                if (vivo)
                    dispatch({
                        type: 'FETCH_ERROR',
                        payload: err.message || 'No se pudieron cargar los videos de ayuda.',
                    });
            }
        })();

        return () => {
            vivo = false;
        };
    }, [active, busquedaDebounced]);

    return { busqueda, setBusqueda, path, setPath, data, loading, error, enBusqueda };
}
