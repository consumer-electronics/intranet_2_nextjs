import React from 'react';
import CreserEncuestaRta from '@/components/rrhh/creser/CreserEncuestaRta';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export const metadata = {
    title: 'Resultados Evaluación | CRESER',
};

export default async function EncuestaRtaPage({ searchParams }) {
    // Next 15+ requiere await searchParams
    const resolvedParams = await searchParams;
    const { et_id, ere_id, idUsu } = resolvedParams;

    if (!et_id || !ere_id) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>
                    Faltan parámetros requeridos para ver esta evaluación.
                </Typography>
                <Button 
                    component={Link} 
                    href="/rrhh/creser" 
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                >
                    Volver a CRESER
                </Button>
            </Box>
        );
    }

    return (
        <CreserEncuestaRta 
            et_id={et_id} 
            ere_id={ere_id} 
            idUsu={idUsu} 
        />
    );
}
