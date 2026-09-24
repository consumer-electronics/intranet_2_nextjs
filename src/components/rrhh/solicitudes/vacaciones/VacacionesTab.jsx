'use client';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';

import {
    useSolicitudesVacaciones,
    ESTADO_VACACIONES,
} from '@/hooks/rrhh/useSolicitudesVacaciones';

import ScopeSelector from '../shared/ScopeSelector';
import PersonalDataGrid from '../shared/PersonalDataGrid';
import SolicitarVacacionesDialog from '../vacaciones/SolicitarVacacionesDialog';
import PermisosVacacionesDialog from '../vacaciones/PermisosVacacionesDialog';

/**
 * Contenido del Tab "Permisos / Vacaciones".
 *
 * Contiene toda la lógica y UI de la vista de vacaciones (anteriormente
 * VacacionesView.jsx). Los diálogos y hooks permanecen intactos.
 *
 * Props:
 *  - funcionarioId {string|number}  ID del funcionario autenticado.
 *  - user          {object}         Objeto del usuario autenticado.
 */
export default function VacacionesTab({ funcionarioId, user }) {
    const {
        // Acceso
        puedeVerTodos,
        // Personal
        personal,
        loadingPersonal,
        personalError,
        fetchPersonal,
        modoLista,
        // Vacaciones de usuario
        vacacionesUsuario,
        loadingVacacionesUsuario,
        fetchVacacionesUsuario,
        // Acciones
        cambiarEstado,
        crearVacaciones,
        fetchDatosPermiso,
        // PDF
        generarPdf,
        descargarPdf,
        marcarPdfAprobado,
        marcarPdfReversado,
        // Correos
        enviarCorreoCreacion,
        enviarCorreoAprobacion,
        enviarCorreoRechazo,
        // Badge
        fetchNumeroVacaciones,
    } = useSolicitudesVacaciones(funcionarioId, user);

    /* ── Estado local ── */
    const [solicitarOpen, setSolicitarOpen] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [vacacionesOpen, setVacacionesOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [estadoActivo, setEstadoActivo] = useState(ESTADO_VACACIONES.EN_ESPERA);
    const [accionandoId, setAccionandoId] = useState(null);
    const [imprimiendoId, setImprimiendoId] = useState(null);

    const personalTableRef = useRef(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const notify = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });
    const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

    /* ── Helpers ── */
    const rowToCorreoPayload = (row) => ({
        id: row.idUsu ?? row.id,
        dias: row.dias,
        fechaInicio: row.fechaInicio,
        fechaFinal: row.fechaFin,
        fechaReintegro: row.fechaReintegro,
        idPermiso: row.idPermiso,
    });

    /* ── Acciones ── */
    const handleVerVacaciones = (row) => {
        const usuario = {
            idUsuario: row.idUsuario ?? row.id,
            nombre: row.nombre ?? '',
        };
        setUsuarioSeleccionado(usuario);
        setEstadoActivo(ESTADO_VACACIONES.EN_ESPERA);
        setVacacionesOpen(true);
        fetchVacacionesUsuario({
            idUsu: usuario.idUsuario,
            idEstado: ESTADO_VACACIONES.EN_ESPERA,
            lider: 1,
        });
    };

    const handleCambiarEstadoFiltro = (estadoId, lider) => {
        setEstadoActivo(estadoId);
        if (usuarioSeleccionado?.idUsuario) {
            fetchVacacionesUsuario({
                idUsu: usuarioSeleccionado.idUsuario,
                idEstado: estadoId,
                lider,
            });
        }
    };

    const handleAprobar = async (row) => {
        if (!row?.idPermiso) return;
        setAccionandoId(row.idPermiso);
        try {
            await cambiarEstado({
                idUsu: usuarioSeleccionado?.idUsuario,
                idPermiso: row.idPermiso,
                idEstado: ESTADO_VACACIONES.APROBADO,
            });
            notify('Se ha aprobado la solicitud de vacaciones.');
            try { await enviarCorreoAprobacion(rowToCorreoPayload(row)); } catch (_) {}
            try {
                await marcarPdfAprobado({
                    idUsu: row.idUsu ?? row.id,
                    idPermiso: row.idPermiso,
                });
            } catch (_) {}
        } catch (err) {
            notify(err?.message || 'Error al aprobar la solicitud.', 'error');
        } finally {
            setAccionandoId(null);
        }
    };

    const handleRechazar = async (row) => {
        if (!row?.idPermiso) return;
        setAccionandoId(row.idPermiso);
        try {
            await cambiarEstado({
                idUsu: usuarioSeleccionado?.idUsuario,
                idPermiso: row.idPermiso,
                idEstado: ESTADO_VACACIONES.RECHAZADO,
            });
            notify('Se ha rechazado la solicitud de vacaciones.');
            try { await enviarCorreoRechazo(rowToCorreoPayload(row)); } catch (_) {}
        } catch (err) {
            notify(err?.message || 'Error al rechazar la solicitud.', 'error');
        } finally {
            setAccionandoId(null);
        }
    };

    const handleReversar = async (row) => {
        if (!row?.idPermiso) return;
        setAccionandoId(row.idPermiso);
        try {
            await cambiarEstado({
                idUsu: usuarioSeleccionado?.idUsuario,
                idPermiso: row.idPermiso,
                idEstado: ESTADO_VACACIONES.RECHAZADO,
            });
            notify('Se ha reversado la solicitud de vacaciones.');
            try {
                await marcarPdfReversado({
                    idUsu: row.idUsu ?? row.id,
                    idPermiso: row.idPermiso,
                });
            } catch (_) {}
            try {
                await enviarCorreoRechazo({
                    ...rowToCorreoPayload(row),
                    reversado: true,
                });
            } catch (_) {}
        } catch (err) {
            notify(err?.message || 'Error al reversar la solicitud.', 'error');
        } finally {
            setAccionandoId(null);
        }
    };

    const handleImprimir = async (row) => {
        if (!row?.idPermiso) return;
        setImprimiendoId(row.idPermiso);
        try {
            await descargarPdf({
                idPermiso: row.idPermiso,
                idUsu: row.idUsu ?? row.id,
            });
            notify('PDF descargado correctamente.');
        } catch (err) {
            notify(err?.message || 'Error al descargar el PDF.', 'error');
        } finally {
            setImprimiendoId(null);
        }
    };

    const handleSolicitarSubmit = async (formData) => {
        setEnviando(true);
        try {
            const response = await crearVacaciones(formData);
            const idPermiso = response?.data?.sp_id ?? response?.data;
            
            if (idPermiso) {
                try {
                    const idUsu = funcionarioId;
                    const datosResponse = await fetchDatosPermiso({ idUsu, idPermiso });
                    const datoss = datosResponse?.data || {};

                    await generarPdf({
                        nombre: user?.nombre || user?.fun_nombre_completo || '',
                        idUsu: idUsu,
                        dias: datoss.sp_dias,
                        fechaInicio: datoss.sp_fecha_inicio,
                        fechaFin: datoss.sp_fecha_fin,
                        fechaReintegro: datoss.sp_fecha_reintegro,
                        idPermiso: idPermiso,
                    });

                    await enviarCorreoCreacion({
                        nombre: user?.nombre || user?.fun_nombre_completo || '',
                        id: idUsu,
                        fechaIni: datoss.sp_fecha_inicio,
                        fechaFin: datoss.sp_fecha_fin,
                        fechaReintegro: datoss.sp_fecha_reintegro,
                        numDias: datoss.sp_dias,
                        respPermiso: idPermiso,
                        token: datoss.token,
                        observaciones: datoss.sp_observaciones || formData.get('observaciones'),
                    });
                } catch (e) {
                    console.error('Error post-creacion:', e);
                }
            }

            setSolicitarOpen(false);
            notify('Solicitud de vacaciones enviada correctamente.');
            await Promise.all([fetchNumeroVacaciones(), fetchPersonal(modoLista)]);
        } catch (err) {
            notify(err?.message || 'No se ha podido enviar la solicitud.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    const handleCambiarModo = (nuevoModo) => {
        fetchPersonal(nuevoModo);
    };

    const handleSync = () => {
        fetchPersonal(modoLista);
        fetchNumeroVacaciones();
    };

    /* ── Render ── */
    return (
        <Box>
            {/* ── Barra de alcance + acción principal ── */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1.5}
                sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <ScopeSelector
                    value={modoLista}
                    onChange={handleCambiarModo}
                    visible={puedeVerTodos}
                    disabled={loadingPersonal}
                />

                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setSolicitarOpen(true)}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                    Solicitar Vacaciones
                </Button>
            </Stack>

            {/* ── Tabla ── */}
            <Box sx={{ p: 3 }}>
                {/* Barra secundaria */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={1}
                    sx={{ mb: 1.5 }}
                >
                    <Tooltip title="Exportar a Excel">
                        <span>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => personalTableRef.current?.triggerExport()}
                                disabled={personal.length === 0}
                            >
                                Exportar
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip title="Sincronizar">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSync}
                            aria-label="Sincronizar datos"
                        >
                            <SyncIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {personalError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {personalError}
                    </Alert>
                ) : (
                    <PersonalDataGrid
                        ref={personalTableRef}
                        rows={personal}
                        loading={loadingPersonal}
                        onRowClick={handleVerVacaciones}
                        mode="vacaciones"
                        exportName={
                            modoLista === 'listaUsuarioTodos'
                                ? 'todo-el-personal-vacaciones'
                                : 'personal-a-cargo-vacaciones'
                        }
                    />
                )}
            </Box>

            {/* ── Diálogos ── */}
            <SolicitarVacacionesDialog
                open={solicitarOpen}
                onClose={() => setSolicitarOpen(false)}
                usuario={user}
                onSubmit={handleSolicitarSubmit}
                submitting={enviando}
            />

            <PermisosVacacionesDialog
                open={vacacionesOpen}
                onClose={() => setVacacionesOpen(false)}
                usuario={usuarioSeleccionado}
                rows={vacacionesUsuario}
                loading={loadingVacacionesUsuario}
                estadoActivo={estadoActivo}
                onCambiarEstado={handleCambiarEstadoFiltro}
                onAprobar={handleAprobar}
                onRechazar={handleRechazar}
                onReversar={handleReversar}
                onImprimir={handleImprimir}
                accionandoId={accionandoId}
                imprimiendoId={imprimiendoId}
            />

            {/* ── Notificaciones ── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={closeSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
