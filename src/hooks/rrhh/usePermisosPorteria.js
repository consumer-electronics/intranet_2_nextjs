'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  checkPermisoAcceso,
  entregarCarnet,
  finalizarPermiso as finalizarPermisoRequest,
  getPermisosPorteria,
  getVisitantesActivos,
} from '@/api/rrhh/permisosPorteria';

function normalizePermisosLegacyRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const rows = [];
  const metaKeys = new Set([
    'sql',
    'cantidad_registros',
    'cantidad_columnas',
  ]);

  Object.entries(payload).forEach(([key, value]) => {
    if (metaKeys.has(key)) return;
    if (!value || typeof value !== 'object') return;
    if (!Object.keys(value).length) return;

    const row = {
      sp_id: value.sp_id ?? value[0] ?? '',
      sp_fecha_inicio: value.sp_fecha_inicio ?? value[1] ?? '',
      sp_hora_inicio: value.sp_hora_inicio ?? value[2] ?? '',
      sp_fecha_fin: value.sp_fecha_fin ?? value[3] ?? '',
      fun_nombre_completo: value.fun_nombre_completo ?? value[4] ?? '',
    };

    rows.push(row);
  });

  return rows;
}

/**
 * Hook central del módulo "Permisos de Portería".
 * Encapsula el fetching, loading/error state y las acciones de negocio,
 * dejando a los componentes de presentación libres de lógica de datos.
 *
 * @param {number|string} funId - id del usuario autenticado, usado para validar el acceso al módulo.
 */
export function usePermisosPorteria(funId) {
  const [accessGranted, setAccessGranted] = useState(null); // null = validando
  const [view, setView] = useState('permisos'); // 'permisos' | 'visitantes'

  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [permisosError, setPermisosError] = useState(null);

  const [visitantes, setVisitantes] = useState([]);
  const [loadingVisitantes, setLoadingVisitantes] = useState(false);
  const [visitantesError, setVisitantesError] = useState(null);

  const [entregados, setEntregados] = useState([]);
  const [loadingEntregados, setLoadingEntregados] = useState(false);
  const [entregadosError, setEntregadosError] = useState(null);

  // --- Validación de acceso al módulo (equivalente a la llamada a funciones.php) ---
  useEffect(() => {
    if (!funId) return undefined;
    let active = true;

    checkPermisoAcceso(funId)
      .then((data) => {
        if (!active) return;

        const permiso = Array.isArray(data)
          ? data.length === 1
          : Array.isArray(data?.data)
            ? data.data.length === 1
            : Array.isArray(data?.msj)
              ? data.msj.length === 1
              : Boolean(data?.permiso || data?.acceso || data?.autorizado || data?.permitido);

        setAccessGranted(permiso);
      })
      .catch(() => {
        if (active) setAccessGranted(false);
      });

    return () => {
      active = false;
    };
  }, [funId]);

  // --- Permisos ---
  const fetchPermisos = useCallback(async () => {
    setLoadingPermisos(true);
    setPermisosError(null);
    try {
      const data = await getPermisosPorteria();
      const rows = normalizePermisosLegacyRows(data?.msj);
      setPermisos(rows);
    } catch (err) {
      setPermisosError(err.message);
    } finally {
      setLoadingPermisos(false);
    }
  }, []);

  const finalizarPermiso = useCallback(
    async (idSolicitudPermiso, formLlegadaHora) => {
      const data = await finalizarPermisoRequest({ idSolicitudPermiso, formLlegadaHora });
      await fetchPermisos();
      return data;
    },
    [fetchPermisos]
  );

  // --- Visitantes ---
  const fetchVisitantes = useCallback(async (params) => {
    setLoadingVisitantes(true);
    setVisitantesError(null);
    try {
      const data = await getVisitantesActivos(params);
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.msj)
            ? data.msj
            : [];
      setVisitantes(rows);
    } catch (err) {
      setVisitantesError(err.message);
    } finally {
      setLoadingVisitantes(false);
    }
  }, []);

  const entregar = useCallback(
    async (id) => {
      await entregarCarnet(id, 2);
      await fetchVisitantes();
    },
    [fetchVisitantes]
  );

  // --- Entregados (histórico por rango de fechas) ---
  const fetchEntregados = useCallback(async (fechaInicial, fechaFinal) => {
    setLoadingEntregados(true);
    setEntregadosError(null);
    try {
      const data = await getVisitantesActivos({ fechaInicial, fechaFinal });
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.msj)
            ? data.msj
            : [];
      const soloEntregados = rows.filter((item) => Number(item.state) === 2);
      setEntregados(soloEntregados);
    } catch (err) {
      setEntregadosError(err.message);
    } finally {
      setLoadingEntregados(false);
    }
  }, []);

  // Carga inicial de permisos una vez se confirma el acceso
  useEffect(() => {
    if (accessGranted) fetchPermisos();
  }, [accessGranted, fetchPermisos]);

  // Carga los visitantes al cambiar a esa vista
  useEffect(() => {
    if (accessGranted && view === 'visitantes') fetchVisitantes();
  }, [accessGranted, view, fetchVisitantes]);

  return {
    accessGranted,
    view,
    setView,

    permisos,
    loadingPermisos,
    permisosError,
    fetchPermisos,
    finalizarPermiso,

    visitantes,
    loadingVisitantes,
    visitantesError,
    fetchVisitantes,
    entregar,

    entregados,
    loadingEntregados,
    entregadosError,
    fetchEntregados,
  };
}
