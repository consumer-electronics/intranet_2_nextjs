'use client';

import { Box, Grid, Stack, Typography } from '@mui/material';

import ProcessPalette from './ProcessPalette';
import { PROCESS_COLOR_VARIANTS } from '@/config/sig/mapaProcesos';

export default function ProcessGroup({ groupData, onSelectDocument }) {
    if (!groupData) return null;

    const { id, title, colorVariant, bgImage, processes } = groupData;
    const variant = PROCESS_COLOR_VARIANTS[colorVariant] || PROCESS_COLOR_VARIANTS.orange;

    const getProcess = (code) => processes.find((p) => p.code === code);

    const renderEstrategicosLayout = () => {
        const e01 = getProcess('E01');
        const e02 = getProcess('E02');

        return (
            <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                {e01 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ProcessPalette process={e01} onSelectDocument={onSelectDocument} />
                    </Grid>
                )}
                {e02 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ProcessPalette process={e02} onSelectDocument={onSelectDocument} />
                    </Grid>
                )}
            </Grid>
        );
    };

    // V01 (arriba-izq) / V02 (arriba-der)  —  V03 (abajo-izq) / V04 (abajo-der)
    const renderValorLayout = () => {
        const v01 = getProcess('V01');
        const v02 = getProcess('V02');
        const v03 = getProcess('V03');
        const v04 = getProcess('V04');

        return (
            <Stack spacing={{ xs: 2, sm: 5 }} sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    {v01 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={v01} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                    {v02 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={v02} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                </Grid>

                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    {v03 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={v03} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                    {v04 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={v04} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                </Grid>
            </Stack>
        );
    };

    // A01 (arriba-izq) / A02 (arriba-der)  —  A03 (abajo-centro)
    const renderApoyoLayout = () => {
        const a01 = getProcess('A01');
        const a02 = getProcess('A02');
        const a03 = getProcess('A03');

        return (
            <Stack spacing={{ xs: 1.5, sm: 3 }} sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                    {a01 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={a01} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                    {a02 && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <ProcessPalette process={a02} onSelectDocument={onSelectDocument} />
                        </Grid>
                    )}
                </Grid>

                {a03 && (
                    <Box sx={{ width: { xs: '100%', sm: '55%' }, mx: 'auto' }}>
                        <ProcessPalette process={a03} onSelectDocument={onSelectDocument} />
                    </Box>
                )}
            </Stack>
        );
    };

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 3,
                p: { xs: 1.5, sm: 2.5 },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: variant.border,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                minHeight: { xs: 'auto', sm: 220 },
            }}
        >
            <Typography
                variant="overline"
                sx={{
                    display: 'block',
                    textAlign: 'center',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: variant.text,
                    mb: 1.5,
                    fontSize: '0.8125rem',
                }}
            >
                {title}
            </Typography>

            {id === 'estrategicos' && renderEstrategicosLayout()}
            {id === 'valor' && renderValorLayout()}
            {id === 'apoyo' && renderApoyoLayout()}
        </Box>
    );
}