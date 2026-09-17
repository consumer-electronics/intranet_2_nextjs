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
                bgcolor: 'background.paper',
            }}
        >
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'stretch' }}>
                {/* Panel Lateral Izquierdo: Contexto Organizacional, Requisitos del cliente, Necesidades y Expectativas */}
                <Grid size={{ xs: 12, md: 2.5 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src="/images/mapa/1-lateral.png"
                        alt="Contexto organizacional y Requisitos del cliente"
                        sx={{
                            width: '100%',
                            maxHeight: { xs: 300, md: 620 },
                            objectFit: 'contain',
                        }}
                    />
                </Grid>

                {/* Panel Centro: Procesos (Estratégicos, Valor, Apoyo) */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={2.5} sx={{ width: '100%' }}>
                        {/* 1. Procesos Estratégicos */}
                        <ProcessGroup
                            groupData={MAPA_PROCESOS.estrategicos}
                            onSelectDocument={onSelectDocument}
                        />

                        {/* 2. Procesos del Valor */}
                        <ProcessGroup
                            groupData={MAPA_PROCESOS.valor}
                            onSelectDocument={onSelectDocument}
                        />

                        {/* 3. Procesos de Apoyo */}
                        <ProcessGroup
                            groupData={MAPA_PROCESOS.apoyo}
                            onSelectDocument={onSelectDocument}
                        />
                    </Stack>
                </Grid>

                {/* Panel Lateral Derecho: Resultados del SIG, Satisfacción del cliente, Productos */}
                <Grid size={{ xs: 12, md: 2.5 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src="/images/mapa/2-lateral.png"
                        alt="Resultados del SIG y Satisfacción del cliente"
                        sx={{
                            width: '100%',
                            maxHeight: { xs: 300, md: 620 },
                            objectFit: 'contain',
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
}
