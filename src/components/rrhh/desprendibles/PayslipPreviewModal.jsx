'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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

/**
 * Modal de previsualización de desprendibles de nómina.
 *
 * Props:
 * - open        {boolean}   Si el modal está abierto.
 * - file        {object}    Objeto del desprendible seleccionado { doc, date, ... }.
 * - previewUrl  {string}    URL del PDF para previsualizar.
 * - loading     {boolean}   Si está cargando la URL de previsualización.
 * - isMobile    {boolean}   Si el dispositivo es móvil (activa fullScreen).
 * - onClose     {function}  Callback para cerrar el modal.
 * - onDownload  {function}  Callback para descargar el desprendible.
 */
export default function PayslipPreviewModal({
    open,
    file,
    previewUrl,
    loading,
    isMobile = false,
    onClose,
    onDownload,
}) {
    const { user } = useAuth();
    const cedula =
        user?.dni ||
        user?.cedula ||
        user?.fun_cedula ||
        user?.fun_usuario ||
        user?.id_usuario;

    const [numPages, setNumPages] = useState(null);
    const [passwordRequest, setPasswordRequest] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [pdfError, setPdfError] = useState(null);
    const [pageWidth, setPageWidth] = useState(760);
    const contentRef = useRef(null);

    // Calcula el ancho disponible para el Page de react-pdf de forma responsiva.
    // Se resta el padding del DialogContent para evitar scroll horizontal.
    const updatePageWidth = useCallback(() => {
        if (contentRef.current) {
            setPageWidth(Math.max(280, contentRef.current.clientWidth - 32));
        }
    }, []);

    // Medir el ancho cuando el modal se abre (con pequeño delay para que el DOM esté listo)
    useEffect(() => {
        if (!open) return undefined;
        const timer = setTimeout(updatePageWidth, 80);
        return () => clearTimeout(timer);
    }, [open, updatePageWidth]);

    // Actualizar el ancho si el contenedor cambia de tamaño (ej: rotación de pantalla)
    useEffect(() => {
        if (!contentRef.current || !open) return undefined;
        const observer = new ResizeObserver(updatePageWidth);
        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [open, updatePageWidth]);

    // Reiniciar estado cuando el modal se cierra
    useEffect(() => {
        if (!open) {
            setNumPages(null);
            setPasswordRequest(null);
            setPasswordInput('');
            setPdfError(null);
        }
    }, [open]);

    const onDocumentLoadSuccess = ({ numPages: total }) => {
        setNumPages(total);
        setPasswordRequest(null);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error al cargar PDF:', error);
        if (error.name !== 'PasswordException') {
            setPdfError('No se pudo cargar el documento.');
        }
    };

    // Callback de react-pdf cuando el PDF pide contraseña
    const onPassword = (callback, reason) => {
        // reason 1 = NEED_PASSWORD, 2 = INCORRECT_PASSWORD
        setPasswordRequest({ callback, reason });
    };

    const handlePasswordSubmit = () => {
        if (passwordRequest?.callback) {
            passwordRequest.callback(passwordInput);
        }
    };

    const handlePasswordCancel = () => {
        setPasswordRequest(null);
        onClose();
    };

    return (
        <>
            {/* ── Modal principal de visualización ── */}
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ pr: 6 }}>
                    {file?.doc || 'Vista previa del PDF'}
                    <IconButton
                        onClick={onClose}
                        aria-label="Cerrar"
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    ref={contentRef}
                    dividers
                    sx={{
                        // En móvil fullScreen el alto se calcula sobre el viewport dinámico
                        height: isMobile ? 'calc(100dvh - 130px)' : '70vh',
                        p: isMobile ? 1 : 2,
                        backgroundColor: '#525659',
                        display: 'flex',
                        justifyContent: 'center',
                        overflow: 'auto',
                    }}
                >
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
                                password={cedula}
                                onPassword={onPassword}
                                loading={
                                    <Stack alignItems="center" justifyContent="center" height="100%" mt={10}>
                                        <CircularProgress sx={{ color: 'white' }} />
                                    </Stack>
                                }
                            >
                                {Array.from(new Array(numPages || 0), (el, index) => (
                                    <Box
                                        key={`page_${index + 1}`}
                                        sx={{ mb: 2, mt: index === 0 ? 2 : 0, boxShadow: 3 }}
                                    >
                                        <Page
                                            pageNumber={index + 1}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            // Ancho calculado dinámicamente para adaptarse al contenedor
                                            // tanto en móvil (pantalla completa) como en desktop
                                            width={pageWidth}
                                        />
                                    </Box>
                                ))}
                            </Document>
                        )
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={onDownload}
                        color="primary"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Descargar
                    </Button>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{ textTransform: 'none' }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Modal de contraseña (PDF protegido) ── */}
            <Dialog
                open={Boolean(passwordRequest)}
                onClose={handlePasswordCancel}
                maxWidth="xs"
                fullWidth
            >
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
                            if (e.key === 'Enter') handlePasswordSubmit();
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