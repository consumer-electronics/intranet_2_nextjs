'use client';

import { Box, Grid, Paper, Stack } from '@mui/material';

import ProcessGroup from './ProcessGroup';
import { MAPA_PROCESOS } from '@/config/sig/mapaProcesos';

export default function MapaProcesos({ onSelectDocument }) {
    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => theme.palette.mode === 'light' ? '#f4f6f8' : 'background.default',
            }}
        >
            <Grid container spacing={{ xs: 1, md: 2 }} sx={{ alignItems: 'center' }}>
                {/* Panel Lateral Izquierdo */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src="/images/mapa/1-lateral.png"
                        alt="Contexto organizacional y Requisitos del cliente"
                        sx={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Grid>

                {/* Panel Centro: Procesos */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box>
                            <ProcessGroup
                                groupData={MAPA_PROCESOS.estrategicos}
                                onSelectDocument={onSelectDocument}
                                containerWidth={{ xs: '100%', md: '100%' }} // ¡Modifica aquí para escalar ESTRATÉGICOS!
                            />
                        </Box>

                        <Box sx={{ mt: { xs: -2, md: -4 } }}>
                            <ProcessGroup
                                groupData={MAPA_PROCESOS.valor}
                                onSelectDocument={onSelectDocument}
                                containerWidth={{ xs: '100%', md: '100%' }} // ¡Modifica aquí para escalar VALOR!
                            />
                        </Box>

                        <Box sx={{ mt: { xs: -2, md: -4 } }}>
                            <ProcessGroup
                                groupData={MAPA_PROCESOS.apoyo}
                                onSelectDocument={onSelectDocument}
                                containerWidth={{ xs: '100%', md: '100%' }} // ¡Modifica aquí para escalar APOYO!
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* Panel Lateral Derecho */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src="/images/mapa/2-lateral.png"
                        alt="Resultados del SIG y Satisfacción del cliente"
                        sx={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
}
