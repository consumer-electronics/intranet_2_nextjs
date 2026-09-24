'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { useDesprendibles } from '@/hooks/rrhh/useDesprendibles';
import PayslipCard from './PayslipCard';
import dynamic from 'next/dynamic';

const PayslipPreviewModal = dynamic(() => import('./PayslipPreviewModal'), { ssr: false });

export default function DesprendiblesView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        files,
        loading,
        error,
        selectedFile,
        previewUrl,
        previewLoading,
        openPreview,
        closePreview,
        downloadFile,
    } = useDesprendibles();


    return (
        <Box>
            <Typography variant="h4" component="h1" fontWeight={700} textAlign="center" gutterBottom>
                Desprendibles de nómina
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" py={6}>
                    <CircularProgress />
                </Stack>
            ) : files.length === 0 ? (
                <Alert severity="info">No se encontraron desprendibles de nómina.</Alert>
            ) : (
                <Stack spacing={1.5}>
                    {files.map((file, index) => (
                        <PayslipCard
                            key={file.doc}
                            file={file}
                            isLatest={index === 0}
                            onSelect={() => openPreview(file)}
                            onDownload={() => downloadFile(file)}
                        />
                    ))}
                </Stack>
            )}

            <PayslipPreviewModal
                open={Boolean(selectedFile)}
                file={selectedFile}
                previewUrl={previewUrl}
                loading={previewLoading}
                isMobile={isMobile}
                onClose={closePreview}
                onDownload={() => selectedFile && downloadFile(selectedFile)}
            />
        </Box>
    );
}