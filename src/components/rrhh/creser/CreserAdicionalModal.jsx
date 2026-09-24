"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, TextField, CircularProgress, IconButton, Alert,
    Stack, Card, CardContent, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { callClassProject } from '@/api/rrhh/creser';

export default function CreserAdicionalModal({ open, onClose, type, encuestaId }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [isEditable, setIsEditable] = useState(false);
    const [error, setError] = useState(null);

    // Formulario para nuevo
    const [newDescription, setNewDescription] = useState('');
    const [newDate, setNewDate] = useState('');

    // Estado para edición en línea (mapa de id -> { description, date })
    const [editingItems, setEditingItems] = useState({});

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await callClassProject('getAdditionalInfo', {
                encuestaId: String(encuestaId),
                type: type.toLowerCase()
            });
            
            if (!res.success) {
                throw new Error(res.error || 'Error al obtener la información');
            }
            
            // PHP devuelve { success, data, isEditable }
            setData(Array.isArray(res.data) ? res.data : (res.data ? Object.values(res.data) : []));
            setIsEditable(Boolean(res.isEditable));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [type, encuestaId]);

    // Cargar información cuando se abre el modal
    useEffect(() => {
        if (open && type && encuestaId) {
            fetchData();
            // Limpiar estado nuevo
            setNewDescription('');
            setNewDate('');
            setEditingItems({});
            setError(null);
        }
    }, [open, type, encuestaId, fetchData]);

    const handleSaveNew = async () => {
        if (!newDescription.trim()) {
            setError('La descripción es obligatoria');
            return;
        }
        if (type.toLowerCase() === 'compromisos' && !newDate) {
            setError('La fecha de revisión es obligatoria para los compromisos');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await callClassProject('saveAdditionalInfo', {
                description: newDescription,
                encuestaId: String(encuestaId),
                type: type.toLowerCase(),
                fechaRevision: newDate || null
            });
            
            if (!res.success) throw new Error(res.error || 'Error al guardar');
            
            setNewDescription('');
            setNewDate('');
            await fetchData();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const toggleEdit = (item) => {
        setEditingItems(prev => ({
            ...prev,
            [item.eread_id]: { 
                description: item.eread_description, 
                date: item.eread_date || '' 
            }
        }));
    };

    const cancelEdit = (id) => {
        setEditingItems(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    const handleEditChange = (id, field, value) => {
        setEditingItems(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSaveEdit = async (id) => {
        const editData = editingItems[id];
        if (!editData.description.trim()) {
            setError('La descripción no puede estar vacía');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const res = await callClassProject('editAdditionalInfo', {
                editInfo: [{
                    id: String(id),
                    description: editData.description,
                    type: type.toLowerCase(),
                    date: editData.date || null
                }]
            });
            
            if (!res.success) throw new Error(res.error || 'Error al actualizar');
            
            cancelEdit(id);
            await fetchData();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (!type) return '';
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    };

    const getInstructions = () => {
        const t = type?.toLowerCase();
        if (t === 'retos') {
            return "Menciona los objetivos planteados que debe alcanzar el colaborador para el próximo año. Ejemplo: Diseñar e implementar un programa de liderazgo.";
        }
        if (t === 'compromisos') {
            return "Menciona los compromisos adquiridos por el colaborador para el próximo periodo.";
        }
        if (t === 'capacitaciones') {
            return "Debe diligenciar una necesidad de capacitación o formación que requiere su colaborador de acuerdo al resultado de competencias.";
        }
        return "";
    };

    const renderItemLabel = (index) => {
        const t = type?.toLowerCase();
        const num = index + 1;
        if (t === 'retos') return `Reto ${num}`;
        if (t === 'compromisos') return `Compromiso ${num}`;
        return `Capacitación ${num}`;
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {getTitle()}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {getInstructions()}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading && data.length === 0 ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                ) : (
                    <Stack spacing={2} mb={3}>
                        {data.length === 0 && !loading && (
                            <Typography variant="body1" textAlign="center" sx={{ fontStyle: 'italic', color: 'text.secondary', p: 3 }}>
                                El usuario aún no ha agregado información en este módulo.
                            </Typography>
                        )}
                        
                        {data.map((item, index) => {
                            const isEditing = !!editingItems[item.eread_id];
                            
                            return (
                                <Card key={item.eread_id} variant="outlined">
                                    <CardContent sx={{ pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="subtitle2" color="primary">
                                                {renderItemLabel(index)}
                                            </Typography>
                                            {isEditable && !isEditing && (
                                                <IconButton size="small" onClick={() => toggleEdit(item)} color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                        
                                        {isEditing ? (
                                            <Stack spacing={2}>
                                                {(type?.toLowerCase() === 'compromisos' || item.eread_date) && (
                                                    <TextField
                                                        label="Fecha de revisión"
                                                        type="date"
                                                        fullWidth
                                                        size="small"
                                                        InputLabelProps={{ shrink: true }}
                                                        value={editingItems[item.eread_id].date}
                                                        onChange={(e) => handleEditChange(item.eread_id, 'date', e.target.value)}
                                                    />
                                                )}
                                                <TextField
                                                    label="Descripción"
                                                    multiline
                                                    rows={3}
                                                    fullWidth
                                                    size="small"
                                                    value={editingItems[item.eread_id].description}
                                                    onChange={(e) => handleEditChange(item.eread_id, 'description', e.target.value)}
                                                />
                                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                                    <Button size="small" onClick={() => cancelEdit(item.eread_id)}>Cancelar</Button>
                                                    <Button size="small" variant="contained" onClick={() => handleSaveEdit(item.eread_id)}>Guardar</Button>
                                                </Box>
                                            </Stack>
                                        ) : (
                                            <>
                                                {item.eread_date && (
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, color: 'text.secondary' }}>
                                                        Fecha de revisión: {item.eread_date}
                                                    </Typography>
                                                )}
                                                <Typography variant="body1">
                                                    {item.eread_description}
                                                </Typography>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}

                {/* Formulario de Adición */}
                {isEditable && (
                    <Box component={Card} variant="outlined" sx={{ bgcolor: 'action.hover', p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Agregar Nuevo
                        </Typography>
                        <Stack spacing={2}>
                            {type?.toLowerCase() === 'compromisos' && (
                                <TextField
                                    label="Fecha Revisión Compromiso"
                                    type="date"
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            )}
                            <TextField
                                label="Descripción"
                                multiline
                                rows={3}
                                fullWidth
                                size="small"
                                placeholder="Escribe aquí..."
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                            <Box display="flex" justifyContent="flex-end">
                                <Button 
                                    variant="contained" 
                                    startIcon={<SaveIcon />} 
                                    onClick={handleSaveNew}
                                    disabled={loading}
                                >
                                    Guardar Nuevo
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
