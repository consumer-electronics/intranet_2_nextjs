'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
    checkPermisoBiometrico,
    getListaBiometrico,
    getMarcacionesBiometrico,
    sincronizarBiometrico,
} from '@/api/biometrico';

const DATE_FORMAT = 'YYYY-MM-DD';

const TAB_MARCACIONES = 'marcaciones';
const TAB_AREA = 'area';
const TAB_TODOS = 'todos';

// Claves de la caché en memoria (Map en useRef).
// - Las listas de empleados ('area'/'todos') NO dependen de fechas.
// - Las marcaciones SÍ dependen del rango de fechas.
const misMarcacionesKey = (inicio, final) => `marcaciones:${inicio}:${final}`;
const listaKey = (tipo) => `lista:${tipo}`;
const empleadoKey = (idUsuario, inicio, final) => `empleado:${idUsuario}:${inicio}:${final}`;

/**
 * Hook central del módulo "Control Biométrico".
 *
 * Estrategia de rendimiento:
 *  - Caché en memoria (Map en useRef) con deduplicación de peticiones:
 *    se guarda la promesa en vuelo dentro de la entrada, así no se
 *    duplica la llamada a Dynamics aunque varios consumidores la pidan.
 *  - Separación entre "datos cargados" (caché) y "datos derivados por
 *    pestaña" (useMemo): cambiar de pestaña NO vuelve a consultar si la
 *    entrada ya existe en caché.
 *  - El parsing de HTML ocurre UNA sola vez en el servidor (route handlers);
 *    el hook solo guarda y reutiliza el JSON ya transformado.
 *  - Prefetch anticipado y silencioso de las listas permitidas, de modo que
 *    al cambiar de pestaña los datos ya están listos sin bloquear la UI.
 *
 * @param {number|string} funId - id del funcionario autenticado (fun_id).
 */
export function useBiometrico(funId) {
    // Pestañas: 'marcaciones' (Mis Marcaciones) | 'area' (Mi Área) | 'todos' (Todos)
    const [tab, setTab] = useState(TAB_MARCACIONES);

    // Rango de fechas seleccionado (arreglo de dos dayjs: inicio y fin)
    const [dateRange, setDateRange] = useState(() => [
        dayjs().startOf('day'),
        dayjs().startOf('day'),
    ]);

    // Permisos que controlan la visibilidad de las pestañas
    const [permisos, setPermisos] = useState({ todos: false, areas: false });
    const [loadingPermisos, setLoadingPermisos] = useState(true);

    // Marcaciones de un empleado seleccionado (diálogo)
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [empleadoMarcaciones, setEmpleadoMarcaciones] = useState([]);
    const [loadingEmpleado, setLoadingEmpleado] = useState(false);
    const [empleadoError, setEmpleadoError] = useState(null);

    // Sincronización del dispositivo biométrico
    const [sincronizando, setSincronizando] = useState(false);

    // Snackbar de retroalimentación
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // ── Caché en memoria ────────────────────────────────────────────────
    // `cacheRef` es el almacén mutable (lectura/escritura SOLO en callbacks y
    // efectos, nunca durante el render). `cache` es una instantánea de estado
    // que refleja el contenido del Map para que los useMemo puedan leerlo en
    // el render sin violar la regla react-hooks/refs. Cada mutación del Map
    // se confirma con `setCache(new Map(cacheRef.current))`.
    const cacheRef = useRef(new Map());
    const [cache, setCache] = useState(() => new Map());

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const closeSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    const inicio = useMemo(() => dateRange[0]?.format(DATE_FORMAT) ?? '', [dateRange]);
    const final = useMemo(() => dateRange[1]?.format(DATE_FORMAT) ?? '', [dateRange]);

    /**
     * Consulta con caché + deduplicación.
     * - Si la entrada está lista → resuelve de inmediato (sin petición).
     * - Si hay una petición en vuelo → reutiliza la misma promesa.
     * - Si no existe → crea la entrada, dispara la petición y guarda el
     *   JSON ya transformado (el parsing HTML ocurrió en el servidor).
     *
     * @param {string} key - clave de la caché.
     * @param {() => Promise<{ data: { rows: Array, message?: string } }>} fetcher
     * @param {{ silent?: boolean }} options - `silent` suprime el snackbar (prefetch).
     */
    const requestWithCache = useCallback(
        (key, fetcher, { silent = false } = {}) => {
            const cache = cacheRef.current;
            const existing = cache.get(key);
            if (existing?.status === 'ready') return Promise.resolve(existing);
            if (existing?.promise) return existing.promise;

            const entry = {
                status: 'loading',
                rows: [],
                message: '',
                error: null,
                promise: null,
            };

            entry.promise = fetcher()
                .then(({ data }) => {
                    entry.status = 'ready';
                    entry.rows = data?.rows ?? [];
                    entry.message = data?.message ?? '';
                    entry.error = null;
                    if (entry.message && !silent) showSnackbar(entry.message, 'info');
                    return entry;
                })
                .catch((err) => {
                    entry.status = 'error';
                    entry.rows = [];
                    entry.error = err?.message || 'No se pudo cargar la información';
                    return entry;
                })
                .finally(() => {
                    entry.promise = null;
                    setCache(new Map(cacheRef.current));
                });

            cache.set(key, entry);
            return entry.promise;
        },
        [showSnackbar]
    );

    /**
     * Garantiza que los datos de `nextTab` estén en caché (sin duplicar peticiones).
     * @param {'marcaciones'|'area'|'todos'} nextTab
     * @param {{ silent?: boolean }} options - silencioso para el prefetch.
     */
    const ensureData = useCallback(
        (nextTab, { silent = false } = {}) => {
            if (nextTab === TAB_MARCACIONES) {
                if (!inicio || !final) return Promise.resolve(null);
                return requestWithCache(
                    misMarcacionesKey(inicio, final),
                    () => getMarcacionesBiometrico({ inicio, final }),
                    { silent }
                );
            }
            return requestWithCache(
                listaKey(nextTab),
                () => getListaBiometrico(nextTab),
                { silent }
            );
        },
        [inicio, final, requestWithCache]
    );

    // Clave de la pestaña activa (para derivar loading/error).
    const activeKey =
        tab === TAB_MARCACIONES ? misMarcacionesKey(inicio, final) : listaKey(tab);

    // ── Datos derivados por pestaña (leídos de la caché) ───────────────
    // No son estado: se recalculan cuando cambia la pestaña o la caché.
    const rows = useMemo(() => {
        if (tab === TAB_MARCACIONES) return [];
        return cache.get(listaKey(tab))?.rows ?? [];
    }, [tab, cache]);

    const misMarcaciones = useMemo(() => {
        if (tab !== TAB_MARCACIONES) return [];
        return cache.get(misMarcacionesKey(inicio, final))?.rows ?? [];
    }, [tab, inicio, final, cache]);

    const loading = useMemo(() => {
        const entry = cache.get(activeKey);
        return entry ? entry.status === 'loading' : true;
    }, [activeKey, cache]);

    const error = useMemo(() => {
        const entry = cache.get(activeKey);
        return entry?.error ?? null;
    }, [activeKey, cache]);

    /**
     * Valida los permisos de las pestañas "Todos" y "Mi Área".
     */
    useEffect(() => {
        let active = true;

        async function loadPermisos() {
            if (!funId) {
                setLoadingPermisos(false);
                return;
            }

            try {
                const [todosRes, areasRes] = await Promise.all([
                    checkPermisoBiometrico(funId, 'biometrico_todos'),
                    checkPermisoBiometrico(funId, 'biometrico_areas'),
                ]);

                if (!active) return;

                const hasTodos = Array.isArray(todosRes) ? todosRes.length > 0 : Boolean(todosRes);
                const hasAreas = Array.isArray(areasRes) ? areasRes.length > 0 : Boolean(areasRes);

                setPermisos({ todos: hasTodos, areas: hasAreas });
            } catch (_) {
                if (!active) return;
                setPermisos({ todos: false, areas: false });
            } finally {
                if (active) setLoadingPermisos(false);
            }
        }

        loadPermisos();

        return () => {
            active = false;
        };
    }, [funId]);

    // Carga de la pestaña activa. Corre al montar y al cambiar de pestaña,
    // pero si la entrada ya está en caché NO vuelve a consultar Dynamics.
    useEffect(() => {
        ensureData(tab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, inicio, final]);

    // Prefetch anticipado (silencioso) de las listas a las que el usuario
    // tiene permiso, para que al cambiar de pestaña ya estén disponibles.
    // NO se dispara mientras cargan los permisos.
    useEffect(() => {
        if (loadingPermisos) return;
        if (permisos.areas && tab !== TAB_AREA) ensureData(TAB_AREA, { silent: true });
        if (permisos.todos && tab !== TAB_TODOS) ensureData(TAB_TODOS, { silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingPermisos, permisos.areas, permisos.todos, inicio, final]);

    /**
     * Cambia de pestaña (respeta los permisos).
     */
    const handleTabChange = useCallback(
        (nextTab) => {
            if (nextTab === TAB_TODOS && !permisos.todos) return;
            if (nextTab === TAB_AREA && !permisos.areas) return;
            setTab(nextTab);
        },
        [permisos]
    );

    /**
     * Recarga la pestaña activa (invalida su entrada de caché).
     */
    const consultar = useCallback(() => {
        cacheRef.current.delete(activeKey);
        setCache(new Map(cacheRef.current));
        ensureData(tab);
    }, [activeKey, tab, ensureData]);

    /**
     * Muestra las marcaciones de un empleado seleccionado (diálogo).
     * @param {{ idUsuario: string|number, nombre: string }} empleado
     */
    const verMarcaciones = useCallback(
        (empleado) => {
            if (!empleado?.idUsuario) return;
            setSelectedEmpleado(empleado);
            setEmpleadoError(null);
            setLoadingEmpleado(true);

            const key = empleadoKey(empleado.idUsuario, inicio, final);
            const existing = cacheRef.current.get(key);
            if (existing?.status === 'ready') {
                setEmpleadoMarcaciones(existing.rows);
                setLoadingEmpleado(false);
                return;
            }

            requestWithCache(key, () =>
                getMarcacionesBiometrico({
                    idUsuario: empleado.idUsuario,
                    inicio,
                    final,
                })
            ).then((entry) => {
                setEmpleadoMarcaciones(entry.rows);
                setEmpleadoError(entry.error);
                setLoadingEmpleado(false);
            });
        },
        [inicio, final, requestWithCache]
    );

    const cerrarMarcaciones = useCallback(() => {
        setSelectedEmpleado(null);
        setEmpleadoMarcaciones([]);
        setEmpleadoError(null);
    }, []);

    /**
     * Dispara la sincronización del dispositivo biométrico.
     * Al terminar invalida toda la caché y recarga la pestaña activa.
     */
    const sincronizar = useCallback(async () => {
        setSincronizando(true);
        try {
            const { data } = await sincronizarBiometrico();
            showSnackbar(data?.message || 'Sincronización completada', data?.ok ? 'success' : 'warning');
            // Tras sincronizar, invalida toda la caché y recarga la pestaña activa.
            cacheRef.current.clear();
            setCache(new Map(cacheRef.current));
            ensureData(tab);
        } catch (err) {
            showSnackbar(err?.message || 'No se pudo sincronizar el dispositivo', 'error');
        } finally {
            setSincronizando(false);
        }
    }, [ensureData, tab, showSnackbar]);

    return {
        // Pestañas y permisos
        tab,
        setTab: handleTabChange,
        permisos,
        loadingPermisos,

        // Rango de fechas
        dateRange,
        setDateRange,
        inicio,
        final,

        // Datos de la pestaña activa (derivados de la caché)
        rows,
        misMarcaciones,
        loading,
        error,

        // Marcaciones de empleado seleccionado (diálogo)
        selectedEmpleado,
        empleadoMarcaciones,
        loadingEmpleado,
        empleadoError,
        verMarcaciones,
        cerrarMarcaciones,

        // Acciones
        consultar,
        sincronizar,
        sincronizando,

        // Snackbar
        snackbar,
        showSnackbar,
        closeSnackbar,
    };
}
