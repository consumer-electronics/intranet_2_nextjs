'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';

export default function DetalleReservacionDialog({
    open,
    evento,
    loading = false,
    onClose,
    onDelete,
}) {
    if (!evento) {
        return null;
    }

    const { title, start, end, extendedProps = {} } = evento;

    const descripcion =
        extendedProps.description ||
        extendedProps.descripcion ||
        'Sin descripción';

    const usuario =
        extendedProps.usuario ||
        extendedProps.userName ||
        'Usuario no disponible';

    const puedeEliminar = evento.puedeEliminar === true;

    const handleDelete = async () => {
        await onDelete(evento);
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!loading) {
                    onClose();
                }
            }}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: 24,
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Detalle de la Reservación
                </Typography>
                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                            {title || 'Reservación'}
                        </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Horario Programado
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {formatearFechaHora(start)} — {formatearFechaHora(end)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Reservado por
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {usuario}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <SubjectIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Descripción
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        mt: 0.5,
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor: 'background.default',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    {descripcion}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                {puedeEliminar ? (
                    <Button
                        color="error"
                        variant="outlined"
                        onClick={handleDelete}
                        disabled={loading}
                        startIcon={<DeleteOutlineIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar Reserva'}
                    </Button>
                ) : (
                    <Box />
                )}

                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="contained"
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function formatearFechaHora(value) {
    if (!value) {
        return '—';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}