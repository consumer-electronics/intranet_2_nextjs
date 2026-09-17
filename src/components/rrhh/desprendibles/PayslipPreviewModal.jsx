'use client';

import { useState, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '@/hooks/useAuth';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PayslipPreviewModal({ open, file, previewUrl, loading, onClose, onDownload }) {
    const { user } = useAuth();
    const cedula = user?.dni || user?.cedula || user?.fun_cedula || user?.fun_usuario || user?.id_usuario;
    const [numPages, setNumPages] = useState(null);
    const [passwordRequest, setPasswordRequest] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [pdfError, setPdfError] = useState(null);

    // Reiniciar estado cuando el modal se cierra o abre
    useEffect(() => {
        if (!open) {
            setNumPages(null);
            setPasswordRequest(null);
            setPasswordInput('');
            setPdfError(null);
        }
    }, [open]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPasswordRequest(null);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error al cargar PDF:', error);
        if (error.name !== 'PasswordException') {
            setPdfError('No se pudo cargar el documento.');
        }
    };

    // Callback llamado por react-pdf cuando pide contraseña
    const onPassword = (callback, reason) => {
        // reason 1 = NEED_PASSWORD, 2 = INCORRECT_PASSWORD
        setPasswordRequest({ callback, reason });
    };

    const handlePasswordSubmit = () => {
        if (passwordRequest?.callback) {
            // Pasamos la contraseña digitada a react-pdf
            passwordRequest.callback(passwordInput);
        }
    };

    const handlePasswordCancel = () => {
        setPasswordRequest(null);
        onClose(); // Cerramos el visor completo si el usuario cancela
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Vista previa del PDF
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ height: '70vh', p: 0, backgroundColor: '#525659', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" height="100%">
                            <CircularProgress sx={{ color: 'white' }} />
                        </Stack>
                    ) : pdfError ? (
                        <Stack alignItems="center" justifyContent="center" height="100%">
                            <Typography color="error" variant="h6">{pdfError}</Typography>
                        </Stack>
                    ) : (
                        previewUrl && (
                            <Document
                                file={previewUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                password={cedula} // Intento automático con cédula
                                onPassword={onPassword}
                                loading={
                                    <Stack alignItems="center" justifyContent="center" height="100%" mt={10}>
                                        <CircularProgress sx={{ color: 'white' }} />
                                    </Stack>
                                }
                            >
                                {Array.from(new Array(numPages || 0), (el, index) => (
                                    <Box key={`page_${index + 1}`} sx={{ mb: 2, mt: index === 0 ? 2 : 0, boxShadow: 3 }}>
                                        <Page 
                                            pageNumber={index + 1} 
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            width={800}
                                        />
                                    </Box>
                                ))}
                            </Document>
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<DownloadIcon />} onClick={onDownload}>
                        Descargar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Contraseña Personalizado */}
            <Dialog open={Boolean(passwordRequest)} onClose={handlePasswordCancel} maxWidth="xs" fullWidth>
                <DialogTitle>Documento Protegido</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {passwordRequest?.reason === 2 
                            ? 'La contraseña ingresada es incorrecta. Por favor, intenta de nuevo.' 
                            : 'Este documento PDF está protegido. Ingresa tu número de documento de identidad para desbloquearlo.'}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Contraseña (Documento)"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handlePasswordSubmit();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasswordCancel} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
                        Abrir Documento
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}