'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { getListaPeriodos, crearPeriodo, actualizarPeriodo } from '@/api/rrhh/creser';

/**
 * CreserPeriodosModal
 *
 * Modal para gestionar los periodos de evaluación CRESER.
 * Equivalente al modal #modalPeriodos en `registros.php`.
 *
 * Funciones:
 *  - Listar periodos existentes
 *  - Crear un nuevo periodo (formulario colapsable)
 *  - Editar el último periodo (inline edit en la tabla)
 *
 * Props:
 *  - open         {boolean}
 *  - onClose      {function}
 *  - onPeriodoGuardado {function}  Se llama después de crear/editar
 *  - userId       {number|string}  ID del usuario creador
 */
export default function CreserPeriodosModal({
    open,
    onClose,
    onPeriodoGuardado,
    userId,
}) {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formulario crear
    const [mostrarForm, setMostrarForm] = useState(false);
    const [formCrear, setFormCrear] = useState({
        periodoInicio: '',
        peridodFinal: '',
        peridoDescripcion: '',
    });
    const [creando, setCreando] = useState(false);
    const [errorCrear, setErrorCrear] = useState(null);

    // Edición inline
    const [editandoId, setEditandoId] = useState(null);
    const [formEditar, setFormEditar] = useState({
        incioPeriodo: '',
        finalPeriodo: '',
        peridoDescripcion: '',
    });
    const [guardando, setGuardando] = useState(false);

    // Toast
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getListaPeriodos();
            const count = data?.cantidad_registros ?? 0;
            const lista = [];
            for (let i = 0; i < count; i++) {
                if (data[i]) lista.push(data[i]);
            }
            setPeriodos(lista);
        } catch (err) {
            setError(err.message ?? 'No se pudo cargar los periodos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            cargar();
            setMostrarForm(false);
            setEditandoId(null);
        }
    }, [open, cargar]);

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!formCrear.periodoInicio || !formCrear.peridodFinal) {
            setErrorCrear('Las fechas de inicio y fin son obligatorias');
            return;
        }
        setCreando(true);
        setErrorCrear(null);
        try {
            await crearPeriodo({ ...formCrear, idUsuario: userId });
            setToast({ open: true, msg: 'Periodo creado correctamente', severity: 'success' });
            setMostrarForm(false);
            setFormCrear({ periodoInicio: '', peridodFinal: '', peridoDescripcion: '' });
            await cargar();
            onPeriodoGuardado?.();
        } catch (err) {
            setErrorCrear(err.message ?? 'No se pudo crear el periodo');
        } finally {
            setCreando(false);
        }
    };

    const iniciarEdicion = (periodo) => {
        if (editandoId) {
            setToast({ open: true, msg: 'Guarda el periodo actual antes de editar otro', severity: 'warning' });
            return;
        }
        setEditandoId(periodo.cp_id);
        setFormEditar({
            incioPeriodo: formatFechaInput(periodo.cp_fecha_inicio),
            finalPeriodo: formatFechaInput(periodo.cp_fecha_fin),
            peridoDescripcion: periodo.cp_descripcion ?? '',
        });
    };

    const handleGuardar = async (idPeriodo) => {
        setGuardando(true);
        try {
            await actualizarPeriodo({ id: idPeriodo, ...formEditar });
            setToast({ open: true, msg: 'Periodo actualizado correctamente', severity: 'success' });
            setEditandoId(null);
            await cargar();
            onPeriodoGuardado?.();
        } catch (err) {
            setToast({ open: true, msg: err.message ?? 'No se pudo actualizar', severity: 'error' });
        } finally {
            setGuardando(false);
        }
    };

    const ultimoIdx = periodos.length - 1;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                aria-labelledby="creser-periodos-modal-title"
            >
                <DialogTitle id="creser-periodos-modal-title">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon color="primary" />
                        <Typography fontWeight={700}>Periodos CRESER</Typography>
                    </Box>
                    <IconButton
                        aria-label="Cerrar"
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 12, top: 12 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {/* Botón crear */}
                    <Button
                        id="creser-periodos-btn-crear"
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setMostrarForm((v) => !v)}
                        sx={{ mb: 2, textTransform: 'none' }}
                    >
                        Crear
                    </Button>

                    {/* Formulario crear */}
                    <Collapse in={mostrarForm}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                            <Box component="form" onSubmit={handleCrear}>
                                {errorCrear && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {errorCrear}
                                    </Alert>
                                )}
                                <Grid container spacing={2} alignItems="flex-end">
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Fecha Inicio"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={formCrear.periodoInicio}
                                            onChange={(e) =>
                                                setFormCrear((f) => ({ ...f, periodoInicio: e.target.value }))
                                            }
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Fecha Fin"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={formCrear.peridodFinal}
                                            inputProps={{ min: formCrear.periodoInicio }}
                                            onChange={(e) =>
                                                setFormCrear((f) => ({ ...f, peridodFinal: e.target.value }))
                                            }
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Descripción"
                                            size="small"
                                            fullWidth
                                            multiline
                                            maxRows={2}
                                            value={formCrear.peridoDescripcion}
                                            onChange={(e) =>
                                                setFormCrear((f) => ({ ...f, peridoDescripcion: e.target.value }))
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="small"
                                            fullWidth
                                            disabled={creando}
                                            startIcon={creando ? <CircularProgress size={14} /> : null}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Enviar
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Collapse>

                    {/* Error / Loading tabla */}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    )}

                    {/* Tabla de periodos */}
                    {!loading && (
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small" aria-label="Lista de periodos CRESER">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'common.white' }}>Periodo</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'common.white' }}>Fecha Inicio</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'common.white' }}>Fecha Fin</TableCell>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'common.white' }}>Descripción</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'common.white' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {periodos.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No hay periodos registrados
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {periodos.map((p, idx) => {
                                        const esUltimo = idx === ultimoIdx;
                                        const editando = editandoId === p.cp_id;

                                        return (
                                            <TableRow key={p.cp_id}>
                                                <TableCell sx={{ fontSize: 11 }}>{p.cp_id}</TableCell>
                                                <TableCell sx={{ fontSize: 11 }}>
                                                    {editando ? (
                                                        <TextField
                                                            type="date"
                                                            size="small"
                                                            value={formEditar.incioPeriodo}
                                                            onChange={(e) =>
                                                                setFormEditar((f) => ({ ...f, incioPeriodo: e.target.value }))
                                                            }
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ width: 140 }}
                                                        />
                                                    ) : (
                                                        formatFechaDisplay(p.cp_fecha_inicio)
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11 }}>
                                                    {editando ? (
                                                        <TextField
                                                            type="date"
                                                            size="small"
                                                            value={formEditar.finalPeriodo}
                                                            inputProps={{ min: formEditar.incioPeriodo }}
                                                            onChange={(e) =>
                                                                setFormEditar((f) => ({ ...f, finalPeriodo: e.target.value }))
                                                            }
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ width: 140 }}
                                                        />
                                                    ) : (
                                                        formatFechaDisplay(p.cp_fecha_fin)
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11 }}>
                                                    {editando ? (
                                                        <TextField
                                                            size="small"
                                                            multiline
                                                            maxRows={2}
                                                            value={formEditar.peridoDescripcion}
                                                            onChange={(e) =>
                                                                setFormEditar((f) => ({ ...f, peridoDescripcion: e.target.value }))
                                                            }
                                                            fullWidth
                                                        />
                                                    ) : (
                                                        p.cp_descripcion
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {esUltimo && (
                                                        editando ? (
                                                            <Button
                                                                id={`creser-periodo-guardar-${p.cp_id}`}
                                                                size="small"
                                                                variant="contained"
                                                                color="primary"
                                                                startIcon={
                                                                    guardando
                                                                        ? <CircularProgress size={12} />
                                                                        : <SaveIcon />
                                                                }
                                                                disabled={guardando}
                                                                onClick={() => handleGuardar(p.cp_id)}
                                                                sx={{ textTransform: 'none', fontSize: 11 }}
                                                            >
                                                                Guardar
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                id={`creser-periodo-editar-${p.cp_id}`}
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<EditIcon />}
                                                                onClick={() => iniciarEdicion(p)}
                                                                sx={{ textTransform: 'none', fontSize: 11 }}
                                                            >
                                                                Editar
                                                            </Button>
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={onClose}
                        startIcon={<CloseIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                >
                    {toast.msg}
                </Alert>
            </Snackbar>
        </>
    );
}

// ── Utilidades de fechas (sin dependencias externas) ─────────────────────────
/**
 * Convierte fecha del backend al formato requerido por input type=date (YYYY-MM-DD).
 * El backend puede devolver "YYYY-MM-DD HH:MM:SS" o "DD/MM/YYYY".
 */
function formatFechaInput(fechaStr) {
    if (!fechaStr) return '';
    // "YYYY-MM-DD" o "YYYY-MM-DD HH:MM:SS"
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) return fechaStr.substring(0, 10);
    // "DD/MM/YYYY"
    const parts = fechaStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    return fechaStr;
}

/** Formatea fecha para mostrar en tabla (DD/MM/YYYY). */
function formatFechaDisplay(fechaStr) {
    if (!fechaStr) return '—';
    // "YYYY-MM-DD" o "YYYY-MM-DD HH:MM:SS"
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
        const [y, m, d] = fechaStr.split('T')[0].split('-');
        return `${d}/${m}/${y}`;
    }
    return fechaStr;
}
