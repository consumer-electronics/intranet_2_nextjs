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

import { useAuth } from '@/hooks/useAuth';
import { useSolicitudes, ESTADO_PERMISO } from '@/hooks/rrhh/useSolicitudes';

import ScopeSelector from '../shared/ScopeSelector';
import PersonalDataGrid from '../shared/PersonalDataGrid';
import SolicitarPermisoDialog from '../SolicitarPermisoDialog';
import PermisosUsuarioDialog from '../PermisosUsuarioDialog';

/**
 * Contenido del Tab "Permisos".
 *
 * Contiene toda la lógica y UI de la vista de permisos (anteriormente
 * SolicitudesView.jsx). Los diálogos y hooks permanecen intactos.
 *
 * Props:
 *  - funcionarioId {string|number}  ID del funcionario autenticado.
 *  - user          {object}         Objeto del usuario autenticado.
 *  - onExportRef   {function}       Recibe la ref de la tabla para exportar (opcional).
 */
export default function PermisosTab({ funcionarioId, user }) {
    const {
        // Acceso
        puedeVerTodos,
        // Personal
        personal,
        loadingPersonal,
        personalError,
        fetchPersonal,
        modoLista,
        // Permisos de usuario
        permisosUsuario,
        loadingPermisosUsuario,
        fetchPermisosUsuario,
        // Acciones
        cambiarEstado,
        crearPermiso,
        // Badge
        fetchNumeroVacaciones,
    } = useSolicitudes(funcionarioId);

    /* ── Estado local ── */
    const [solicitarOpen, setSolicitarOpen] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [permisosOpen, setPermisosOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [estadoActivo, setEstadoActivo] = useState(ESTADO_PERMISO.EN_ESPERA);
    const [accionandoId, setAccionandoId] = useState(null);

    const personalTableRef = useRef(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const notify = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });
    const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

    /* ── Acciones ── */

    const handleVerPermisos = (row) => {
        const usuario = {
            idUsuario: row.idUsuario ?? row.id,
            nombre: row.nombre ?? '',
        };
        setUsuarioSeleccionado(usuario);
        setEstadoActivo(ESTADO_PERMISO.EN_ESPERA);
        setPermisosOpen(true);
        fetchPermisosUsuario({
            idUsu: usuario.idUsuario,
            idEstado: ESTADO_PERMISO.EN_ESPERA,
            lider: 1,
        });
    };

    const handleCambiarEstadoFiltro = (estadoId, lider) => {
        setEstadoActivo(estadoId);
        if (usuarioSeleccionado?.idUsuario) {
            fetchPermisosUsuario({
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
                idEstado: ESTADO_PERMISO.APROBADO,
            });
            notify('Se ha aprobado el permiso.');
        } catch (err) {
            notify(err?.message || 'Error al aprobar el permiso.', 'error');
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
                idEstado: ESTADO_PERMISO.RECHAZADO,
            });
            notify('Se ha rechazado el permiso.');
        } catch (err) {
            notify(err?.message || 'Error al rechazar el permiso.', 'error');
        } finally {
            setAccionandoId(null);
        }
    };

    const handleSolicitarSubmit = async (formData) => {
        setEnviando(true);
        try {
            await crearPermiso(formData);
            setSolicitarOpen(false);
            notify('Permiso solicitado correctamente.');
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

                {/* Spacer solo en fila */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setSolicitarOpen(true)}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                    Solicitar Permiso
                </Button>
            </Stack>

            {/* ── Tabla ── */}
            <Box sx={{ p: 3 }}>
                {/* Barra secundaria: exportar + sincronizar */}
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
                        onRowClick={handleVerPermisos}
                        mode="permisos"
                        exportName={
                            modoLista === 'listaUsuarioTodos'
                                ? 'todo-el-personal-permisos'
                                : 'personal-a-cargo-permisos'
                        }
                    />
                )}
            </Box>

            {/* ── Diálogos ── */}
            <SolicitarPermisoDialog
                open={solicitarOpen}
                onClose={() => setSolicitarOpen(false)}
                usuario={user}
                onSubmit={handleSolicitarSubmit}
                submitting={enviando}
            />

            <PermisosUsuarioDialog
                open={permisosOpen}
                onClose={() => setPermisosOpen(false)}
                usuario={usuarioSeleccionado}
                rows={permisosUsuario}
                loading={loadingPermisosUsuario}
                estadoActivo={estadoActivo}
                onCambiarEstado={handleCambiarEstadoFiltro}
                onAprobar={handleAprobar}
                onRechazar={handleRechazar}
                accionandoId={accionandoId}
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
