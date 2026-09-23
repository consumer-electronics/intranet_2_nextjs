'use client';

import { useState } from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, Paper, Tab, Tabs } from '@mui/material';

import DocumentosGeneralesPanel from './DocumentosGeneralesPanel';
import MapaProcesos from '../mapa-procesos/MapaProcesos';

const TABS = [
    { id: 'mapa', label: 'Mapa de procesos', icon: <AccountTreeOutlinedIcon fontSize="small" /> },
    { id: 'documentos', label: 'Documentos generales', icon: <FolderOutlinedIcon fontSize="small" /> },
];

export default function InfoDocumentadaView() {
    const [tabActivo, setTabActivo] = useState('mapa');

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
                value={tabActivo}
                onChange={(_, value) => setTabActivo(value)}
                sx={{ px: { xs: 1, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                {TABS.map((tab) => (
                    <Tab
                        key={tab.id}
                        value={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        iconPosition="start"
                        sx={{ minHeight: 56 }}
                    />
                ))}
            </Tabs>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: tabActivo === 'mapa' ? 'block' : 'none' }}>
                    <MapaProcesos />
                </Box>
                <Box sx={{ display: tabActivo === 'documentos' ? 'block' : 'none' }}>
                    <DocumentosGeneralesPanel active={tabActivo === 'documentos'} />
                </Box>
            </Box>
        </Paper>
    );
}