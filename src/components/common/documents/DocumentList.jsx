'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';

import DocumentCard from './DocumentCard';

/**
 * Lista de documentos renderizada como grid de tarjetas.
 *
 * Movido desde components/sig/common/SigDocumentList.jsx
 * — eliminado el prefijo "Sig" para hacerlo globalmente reutilizable.
 *
 * Props:
 * - items        {array}    Lista de ítems de documento/carpeta.
 * - loading      {boolean}  Muestra esqueletos mientras carga.
 * - onSelect     {function} Callback al seleccionar un ítem.
 * - emptyMessage {string}   Mensaje cuando no hay ítems.
 */
export default function DocumentList({
    items = [],
    loading = false,
    onSelect,
    emptyMessage = 'No hay documentos configurados para esta sección.',
}) {
    if (loading) {
        return (
            <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!items || items.length === 0) {
        return (
            <Paper
                variant="outlined"
                sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}
            >
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <InfoOutlinedIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" color="text.primary">
                        Sección sin documentos
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1, maxWidth: 450 }}>
                        {emptyMessage}
                    </Alert>
                </Stack>
            </Paper>
        );
    }

    return (
        <Grid container spacing={2}>
            {items.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <DocumentCard item={item} onSelect={onSelect} />
                </Grid>
            ))}
        </Grid>
    );
}
