"use client";

import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, CircularProgress, Alert, Button,
    Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutlined';
import { useRouter } from 'next/navigation';
import { getEncuestaRta } from '@/api/rrhh/creser';
import CreserAdicionalModal from './CreserAdicionalModal';

// Pequeño componente para las tarjetas de promedios
const ScoreCard = ({ title, score, icon, isTotal = false }) => {
    let bgColor = 'primary.main';
    let textColor = 'common.white';
    let starIcon = icon;

    if (isTotal && typeof score === 'number') {
        if (score < 3) {
            bgColor = 'error.main';
            starIcon = <StarOutlineIcon fontSize="large" />;
        } else if (score < 4) {
            bgColor = 'warning.main';
            starIcon = <StarHalfIcon fontSize="large" />;
        } else {
            bgColor = 'success.main';
            starIcon = <StarIcon fontSize="large" />;
        }
    }

    return (
        <Card sx={{ bgcolor: bgColor, color: textColor, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '16px !important' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        {score}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ opacity: 0.8 }}>
                    {starIcon}
                </Box>
            </CardContent>
        </Card>
    );
};

export default function CreserEncuestaRta({ et_id, ere_id, idUsu }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Estado del modal adicional (Retos, Compromisos, Capacitaciones)
    const [modalConfig, setModalConfig] = useState({ open: false, type: '' });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                setLoading(true);
                const res = await getEncuestaRta({ et_id, ere_id, idUsu });
                setData(res);
            } catch (err) {
                setError(err.message || 'Error al obtener la encuesta');
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [et_id, ere_id, idUsu]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error || 'No se encontraron datos'}</Alert>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Volver
                </Button>
            </Box>
        );
    }

    const handleOpenModal = (type) => {
        setModalConfig({ open: true, type });
    };

    const handleCloseModal = () => {
        setModalConfig({ open: false, type: '' });
    };

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Volver
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenModal('retos')}>
                        Retos
                    </Button>
                    <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenModal('compromisos')}>
                        Compromisos
                    </Button>
                    <Button variant="contained" color="secondary" size="small" onClick={() => handleOpenModal('capacitaciones')}>
                        Capacitaciones
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Panel lateral: Promedios */}
                <Grid item xs={12} md={3}>
                    <Stack spacing={2}>
                        <ScoreCard
                            title="Promedio competencias organizacionales"
                            score={data.promedios?.organizacionales}
                            icon={<AssignmentIcon fontSize="large" />}
                        />
                        <ScoreCard
                            title="Promedio competencias técnicas"
                            score={data.promedios?.tecnicas}
                            icon={<SchoolIcon fontSize="large" />}
                        />
                        <ScoreCard
                            title="Promedio objetivos"
                            score={data.promedios?.objetivos}
                            icon={<EmojiEventsIcon fontSize="large" />}
                        />
                        <ScoreCard
                            title="Puntaje total"
                            score={data.promedios?.total}
                            isTotal={true}
                        />
                    </Stack>
                </Grid>

                {/* Panel principal: Tablas */}
                <Grid item xs={12} md={9}>
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h5" color="primary" gutterBottom>
                                {data.titulo}
                            </Typography>
                            {data.descripcion && (
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    <span dangerouslySetInnerHTML={{ __html: data.descripcion }} />
                                </Typography>
                            )}

                            {/* Atributos Generales */}
                            {data.atributos && data.atributos.length > 0 && (
                                <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                                    <Table size="small">
                                        <TableBody>
                                            {data.atributos.map((atr, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%', bgcolor: 'action.hover' }}>
                                                        {atr.titulo}
                                                    </TableCell>
                                                    <TableCell>{atr.valor}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Grupos de Competencias */}
                            {data.grupos && data.grupos.map((grupo) => (
                                <Box key={grupo.id} sx={{ mb: 4 }}>
                                    <TableContainer component={Paper} variant="outlined" sx={{ border: grupo.alerta_nivel ? '2px solid #d32f2f' : undefined }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" colSpan={grupo.parametros.length + 3} sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                                                        {grupo.titulo}
                                                    </TableCell>
                                                </TableRow>
                                                {grupo.descripcion && (
                                                    <TableRow>
                                                        <TableCell align="center" colSpan={grupo.parametros.length + 3} sx={{ bgcolor: 'action.hover' }}>
                                                            {grupo.descripcion}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold' }}>Variable</TableCell>
                                                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold' }}>Explicación</TableCell>
                                                    {grupo.parametros.map((param) => (
                                                        <TableCell key={param.id} align="center" title={param.descripcion} sx={{ fontWeight: 'bold', fontSize: 11 }}>
                                                            {param.titulo}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    {grupo.parametros.map((param) => (
                                                        <TableCell key={`val-${param.id}`} align="center" sx={{ fontWeight: 'bold' }}>
                                                            {param.valor}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {grupo.preguntas.map((pregunta) => (
                                                    <TableRow key={pregunta.id} hover>
                                                        <TableCell>{pregunta.titulo}</TableCell>
                                                        <TableCell>
                                                            <span dangerouslySetInnerHTML={{ __html: pregunta.descripcion }} />
                                                        </TableCell>
                                                        {grupo.parametros.map((param) => (
                                                            <TableCell key={`chk-${param.id}`} align="center" sx={{ fontWeight: 'bold' }}>
                                                                {pregunta.respuesta_epa_id === param.id ? 'X' : ''}
                                                            </TableCell>
                                                        ))}
                                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                            {pregunta.respuesta_valor || ''}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {/* Promedio del grupo */}
                                                <TableRow>
                                                    <TableCell colSpan={grupo.parametros.length + 2} align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                                        Promedio
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                                                        {grupo.promedio}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ))}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Modal de información adicional (Retos, Compromisos, Capacitaciones) */}
            <CreserAdicionalModal
                open={modalConfig.open}
                onClose={handleCloseModal}
                type={modalConfig.type}
                encuestaId={ere_id}
            />
        </Box>
    );
}
