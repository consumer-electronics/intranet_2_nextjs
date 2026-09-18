'use client';

import { useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

import { INFO_INTERES_GENERAL_ITEMS } from '@/config/sig/infoInteresGeneralDocuments';
import FolderBrowser from '@/components/sig/info-documentada/FolderBrowser';

export default function InfoInteresGeneralView() {
    // Usamos el ID del primer ítem como tab por defecto
    const [tabActivo, setTabActivo] = useState(INFO_INTERES_GENERAL_ITEMS[0]?.id || '');

    const getIcon = (id) => {
        if (id === 'certificaciones') return <FolderSpecialOutlinedIcon fontSize="small" />;
        if (id === 'revision_direccion') return <AssignmentTurnedInOutlinedIcon fontSize="small" />;
        if (id === 'formatos_uso_comun') return <FileCopyOutlinedIcon fontSize="small" />;
        return <FolderSpecialOutlinedIcon fontSize="small" />;
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
                value={tabActivo}
                onChange={(_, value) => setTabActivo(value)}
                sx={{ px: { xs: 1, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}
                variant="scrollable"
                scrollButtons="auto"
            >
                {INFO_INTERES_GENERAL_ITEMS.map((item) => (
                    <Tab
                        key={item.id}
                        value={item.id}
                        label={item.label}
                        icon={getIcon(item.id)}
                        iconPosition="start"
                        sx={{ minHeight: 56 }}
                    />
                ))}
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {INFO_INTERES_GENERAL_ITEMS.map((item) => (
                    <Box key={item.id} sx={{ display: tabActivo === item.id ? 'block' : 'none' }}>
                        <FolderBrowser 
                            active={tabActivo === item.id} 
                            tituloRaiz={item.label} 
                            carpetaBase={item.file} 
                        />
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
