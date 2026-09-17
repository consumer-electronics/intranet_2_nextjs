'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

import FolderBrowser from './FolderBrowser';

/**
 * Modal usado desde el Mapa de procesos (ProcessPalette): abre el explorador
 * acotado a la carpeta del proceso (carpetaBase).
 */
export default function FolderExplorerModal({ open, onClose, titulo = 'Documentos generales', carpetaBase }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {titulo}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <FolderBrowser carpetaBase={carpetaBase} tituloRaiz={titulo} active={open} />
            </DialogContent>
        </Dialog>
    );
}