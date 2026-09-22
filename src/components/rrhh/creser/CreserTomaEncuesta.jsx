"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Paper, Typography, Button, CircularProgress, Alert,
    TextField, RadioGroup, FormControlLabel, Radio,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider, Stack, Card, CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { getEncuestaTakeForm, saveEncuestaTakeForm } from '@/api/rrhh/creser';
import { useAuth } from '@/hooks/useAuth';

export default function CreserTomaEncuesta({ et_id, filtro_atr }) {
    const router = useRouter();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    
    // Estado del formulario: { "atr_10": "3160", "grupo_1_pregunta_2": "5", ... }
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        if (!et_id) return;
        
        const loadForm = async () => {
            try {
                setLoading(true);
                const res = await getEncuestaTakeForm(et_id);
                if (!res.success) throw new Error(res.message);
                
                setData(res);
                
                // Inicializar formValues con valores predeterminados
                const initialValues = {};
                
                // Si viene filtro_atr en la URL (ej: "10|3160"), extraemos para asignarlo
                let filtroId = null;
                let filtroVal = null;
                if (filtro_atr && filtro_atr.includes('|')) {
                    const parts = filtro_atr.split('|');
                    filtroId = `atr_${parts[0]}`;
                    filtroVal = parts[1];
                }

                res.atributos?.forEach(atr => {
                    if (filtroId === atr.name) {
                        initialValues[atr.name] = filtroVal;
                    } else if (atr.predeterminado) {
                        initialValues[atr.name] = atr.predeterminado;
                    } else {
                        initialValues[atr.name] = '';
                    }
                });
                
                // Preguntas vacías y sus campos de texto asociados si los tienen
                res.grupos?.forEach(g => {
                    g.preguntas?.forEach(p => {
                        initialValues[p.name] = '';
                        if (p.input_id) {
                            initialValues[p.input_id] = '';
                        }
                    });
                });
                
                setFormValues(initialValues);
            } catch (err) {
                setError(err.message || "Error al cargar el formulario");
            } finally {
                setLoading(false);
            }
        };
        
        loadForm();
    }, [et_id, filtro_atr]);

    const handleAtrChange = (name, value) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validación básica
        let errors = [];
        
        data.atributos?.forEach(atr => {
            if (!formValues[atr.name]) {
                errors.push(`Falta diligenciar: ${atr.titulo}`);
            }
        });

        data.grupos?.forEach(g => {
            g.preguntas?.forEach(p => {
                // Si la pregunta tiene un input_id (ej: para escribir el objetivo),
                // verificamos que ambos campos estén llenos
                if (p.input_id) {
                    if (!formValues[p.input_id] && formValues[p.name]) {
                        errors.push(`Falta escribir la descripción para: ${p.titulo} (${g.titulo})`);
                    } else if (formValues[p.input_id] && !formValues[p.name]) {
                        errors.push(`Falta calificar el objetivo: ${p.titulo} (${g.titulo})`);
                    }
                } else if (!formValues[p.name]) {
                    errors.push(`Falta contestar: ${p.titulo} (${g.titulo})`);
                }
            });
        });

        if (errors.length > 0) {
            alert(`Por favor completa todos los campos.\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            const formData = new FormData();
            formData.append('et_fk', et_id);
            formData.append('ejecutar_accion', 'guardar_encuesta');
            
            Object.keys(formValues).forEach(key => {
                formData.append(key, formValues[key]);
            });

            const res = await saveEncuestaTakeForm(formData);
            
            if (res.exito === 1 || res.success) {
                alert("Encuesta registrada satisfactoriamente");
                router.back();
            } else {
                throw new Error(res.message || res.error || "Ocurrió un error al guardar.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !data) {
        return (
            <Box maxWidth={800} mx="auto" mt={4} px={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, mb: 5, px: { xs: 1, sm: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ textTransform: 'none' }}
                >
                    Volver
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" color="primary" fontWeight="bold" textAlign="center" gutterBottom>
                    {data.titulo}
                </Typography>
                {data.descripcion && (
                    <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
                        {data.descripcion}
                    </Typography>
                )}
                
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Divider sx={{ my: 3 }} />

                {/* 1. Atributos (Variables) */}
                {data.atributos && data.atributos.length > 0 && (
                    <Box mb={4}>
                        <Typography variant="h6" gutterBottom>Datos de la Evaluación</Typography>
                        <Stack spacing={3}>
                            {data.atributos.map(atr => {
                                // Si es la fecha readonly o el usuario forzado por la URL
                                const isForcedFromUrl = filtro_atr?.split('|')[0] === atr.id;
                                const isReadonly = atr.readonly || isForcedFromUrl;
                                
                                return (
                                    <TextField
                                        key={atr.id}
                                        label={atr.titulo}
                                        type={atr.type === 'datetime' ? 'datetime-local' : (atr.type === 'int' ? 'number' : 'text')}
                                        multiline={atr.type === 'text'}
                                        rows={atr.type === 'text' ? 3 : 1}
                                        defaultValue={formValues[atr.name] || ''}
                                        onBlur={(e) => handleAtrChange(atr.name, e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            readOnly: isReadonly,
                                        }}
                                        disabled={isReadonly}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                {/* 2. Grupos y Preguntas */}
                {data.grupos && data.grupos.map(grupo => (
                    <Card key={grupo.id} variant="outlined" sx={{ mb: 4, overflow: 'visible' }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ bgcolor: 'action.hover', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" color="primary">{grupo.titulo}</Typography>
                                {grupo.descripcion && (
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        dangerouslySetInnerHTML={{ __html: grupo.descripcion }} 
                                    />
                                )}
                            </Box>
                            
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Competencia</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Descripción</TableCell>
                                            {grupo.parametros?.map(param => (
                                                <TableCell key={param.id} align="center" sx={{ fontWeight: 'bold' }}>
                                                    {param.titulo}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        ({param.valor})
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {grupo.preguntas?.map(preg => (
                                            <TableRow key={preg.id} hover>
                                                <TableCell sx={{ fontWeight: 500 }}>{preg.titulo}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                                    {/* Eliminar tag <input> si viene en la BD, porque lo renderizamos con TextField de MUI */}
                                                    {preg.descripcion.replace(/<input[^>]*>/gi, '')}
                                                    {preg.input_id && (
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            variant="standard"
                                                            placeholder="Escriba aquí..."
                                                            defaultValue={formValues[preg.input_id] || ''}
                                                            onBlur={(e) => handleAtrChange(preg.input_id, e.target.value)}
                                                            sx={{ mt: 1 }}
                                                        />
                                                    )}
                                                </TableCell>
                                                {grupo.parametros?.map(param => (
                                                    <TableCell key={param.id} align="center">
                                                        <Radio
                                                            size="small"
                                                            checked={formValues[preg.name] === String(param.id)}
                                                            onChange={(e) => handleAtrChange(preg.name, e.target.value)}
                                                            value={param.id}
                                                            name={preg.name}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                ))}

                <Box display="flex" justifyContent="flex-end" mt={4}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Enviar Evaluación"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
