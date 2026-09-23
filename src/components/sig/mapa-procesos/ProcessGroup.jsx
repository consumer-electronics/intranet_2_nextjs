'use client';

import { Box, Grid } from '@mui/material';
import ProcessPalette from './ProcessPalette';
import { PROCESS_COLOR_VARIANTS } from '@/config/sig/mapaProcesos';

export default function ProcessGroup({ groupData, onSelectDocument, containerWidth = '100%' }) {
    if (!groupData) return null;

    const { id, title, colorVariant, bgImage, processes } = groupData;
    const variant = PROCESS_COLOR_VARIANTS[colorVariant] || PROCESS_COLOR_VARIANTS.orange;

    // Helper para buscar un proceso por su código
    const getProcess = (code) => processes.find(p => p.code === code);

    // Renderiza un único proceso, aplicando offset en todas las resoluciones
    const renderProcess = (code) => {
        const process = getProcess(code);
        if (!process) return null;
        
        // Convertir el offset para que aplique siempre
        const responsiveOffset = {};
        if (process.offset) {
            for (const [key, value] of Object.entries(process.offset)) {
                // si el usuario escribió mal 'buttom', lo arreglamos
                const safeKey = key === 'buttom' ? 'bottom' : key;
                responsiveOffset[safeKey] = value;
            }
        }

        return (
            <Box sx={{ position: 'relative', width: '100%', ...responsiveOffset }}>
                <ProcessPalette process={process} onSelectDocument={onSelectDocument} />
            </Box>
        );
    };

    // Estilos comunes para el contenedor del overlay (absoluto siempre)
    const overlayWrapperStyles = {
        position: 'absolute', 
        top: 0, left: 0, width: '100%', height: '100%', 
        display: 'flex'
    };

    // Estratégicos: E01 - Centro vacío - E02
    if (id === 'estrategicos') {
        return (
            <Box sx={{ position: 'relative', width: containerWidth, margin: 'auto' }}>
                <Box component="img" src={bgImage} alt={title} sx={{ width: '100%', height: 'auto', display: 'block' }} />
                
                <Box sx={{ ...overlayWrapperStyles, alignItems: 'center' }}>
                    <Grid container sx={{ width: '100%' }}>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {renderProcess('E01')}
                        </Grid>
                        <Grid size={4}></Grid> {/* Espacio central */}
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            {renderProcess('E02')}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    // Valor: 2x2 (V01 arriba-izq, V02 arriba-der, V03 abajo-izq, V04 abajo-der)
    if (id === 'valor') {
        return (
            <Box sx={{ position: 'relative', width: containerWidth, margin: 'auto' }}>
                <Box component="img" src={bgImage} alt={title} sx={{ width: '100%', height: 'auto', display: 'block' }} />
                
                <Box sx={{ ...overlayWrapperStyles, flexDirection: 'column', justifyContent: 'space-around', py: { xs: 0, md: 2 } }}>
                    {/* Fila Superior */}
                    <Grid container>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {renderProcess('V01')}
                        </Grid>
                        <Grid size={4}></Grid>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            {renderProcess('V02')}
                        </Grid>
                    </Grid>
                    
                    {/* Fila Inferior */}
                    <Grid container>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {renderProcess('V03')}
                        </Grid>
                        <Grid size={4}></Grid>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            {renderProcess('V04')}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    // Apoyo
    if (id === 'apoyo') {
        return (
            <Box sx={{ position: 'relative', width: containerWidth, margin: 'auto' }}>
                <Box component="img" src={bgImage} alt={title} sx={{ width: '100%', height: 'auto', display: 'block' }} />
                
                <Box sx={{ ...overlayWrapperStyles, flexDirection: 'column', justifyContent: 'space-around' }}>
                    <Grid container>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {renderProcess('A01')}
                        </Grid>
                        <Grid size={4}></Grid>
                        <Grid size={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            {renderProcess('A02')}
                        </Grid>
                    </Grid>
                    
                    <Grid container justifyContent="center">
                        <Grid size={6}>
                            {renderProcess('A03')}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    return null;
}