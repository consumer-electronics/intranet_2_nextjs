'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkPermisoCreser, getListaUsuariosCreser, getListaPeriodos } from '@/api/rrhh/creser';

/**
 * useCreser
 *
 * Hook principal del módulo CRESER.
 * Centraliza:
 *  - Verificación del permiso "registros_creser"
 *  - Carga de la lista de usuarios (HTML string del backend)
 *  - Carga del listado de periodos
 *
 * @param {number|string|null} funId - ID del funcionario autenticado
 */
export function useCreser(funId) {
    const [puedeVerRegistros, setPuedeVerRegistros] = useState(false);
    const [permisoCargado, setPermisoCargado] = useState(false);

    const [listaHtml, setListaHtml] = useState('');
    const [listaLoading, setListaLoading] = useState(false);
    const [listaError, setListaError] = useState(null);

    const [periodos, setPeriodos] = useState([]);
    const [periodosLoading, setPeriodosLoading] = useState(false);
    const [periodosError, setPeriodosError] = useState(null);

    // ── Verificar permiso registros_creser ──────────────────────────────────
    useEffect(() => {
        if (!funId) return;
        let active = true;

        checkPermisoCreser(funId)
            .then(({ granted }) => {
                if (active) {
                    setPuedeVerRegistros(Boolean(granted));
                    setPermisoCargado(true);
                }
            })
            .catch(() => {
                if (active) setPermisoCargado(true);
            });

        return () => { active = false; };
    }, [funId]);

    // ── Cargar lista de usuarios ────────────────────────────────────────────
    const cargarListaUsuarios = useCallback(async () => {
        if (!funId) return;
        setListaLoading(true);
        setListaError(null);
        try {
            const { html } = await getListaUsuariosCreser(funId);
            setListaHtml(html ?? '');
        } catch (err) {
            setListaError(err.message ?? 'No se pudo cargar la lista de usuarios');
        } finally {
            setListaLoading(false);
        }
    }, [funId]);

    useEffect(() => {
        cargarListaUsuarios();
    }, [cargarListaUsuarios]);

    // ── Cargar periodos ─────────────────────────────────────────────────────
    const cargarPeriodos = useCallback(async () => {
        setPeriodosLoading(true);
        setPeriodosError(null);
        try {
            const data = await getListaPeriodos();
            const count = data?.cantidad_registros ?? 0;
            const lista = [];
            for (let i = 0; i < count; i++) {
                if (data[i]) lista.push(data[i]);
            }
            setPeriodos(lista);
        } catch (err) {
            setPeriodosError(err.message ?? 'No se pudo cargar la lista de periodos');
        } finally {
            setPeriodosLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPeriodos();
    }, [cargarPeriodos]);

    return {
        // Permiso
        puedeVerRegistros,
        permisoCargado,
        // Lista usuarios (HTML del backend)
        listaHtml,
        listaLoading,
        listaError,
        recargarLista: cargarListaUsuarios,
        // Periodos
        periodos,
        periodosLoading,
        periodosError,
        recargarPeriodos: cargarPeriodos,
    };
}
