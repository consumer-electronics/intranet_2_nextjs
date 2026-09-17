'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import MediaUploader from './MediaUploader';

const TIPOS = [
  'NOTICIA',
  'COMUNICADO',
  'INFORMATIVO',
  'CAMPAÑA',
  'EVENTO',
  'VIDEO',
];

const TIPOS_MEDIA = ['IMAGEN', 'VIDEO'];

const ESTADOS = [
  'BORRADOR',
  'PROGRAMADO',
  'PUBLICADO',
  'EXPIRADO',
  'INACTIVO',
];

const initialFormState = {
  titulo: '',
  descripcion: '',
  tipo: 'NOTICIA',
  tipoMedia: 'IMAGEN',
  mediaUrl: '',
  thumbnailUrl: '',
  categoria: '',
  estado: 'BORRADOR',
  destacado: false,
  fechaPublicacion: '',
  fechaExpiracion: '',
};

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

function FormSection({ title, description, children }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.25 },
        borderRadius: 1.5,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Paper>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Field                                                                 */
/* -------------------------------------------------------------------------- */

function DateField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  const dayjsValue = value ? dayjs(value) : null;

  const handleDateChange = (newValue) => {
    const formatted = newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '';
    onChange({
      target: {
        name,
        value: formatted,
      },
    });
  };

  return (
    <DatePicker
      label={label}
      value={dayjsValue}
      onChange={handleDateChange}
      format="DD/MM/YYYY"
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          required,
          id: name,
          name,
        },
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          height: 40,
        },
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ContentForm({
  initialData,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormState,
        ...initialData,
        fechaPublicacion: initialData.fechaPublicacion
          ? initialData.fechaPublicacion.split('T')[0]
          : '',
        fechaExpiracion: initialData.fechaExpiracion
          ? initialData.fechaExpiracion.split('T')[0]
          : '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUploadComplete = (url) => {
    setFormData((prev) => ({
      ...prev,
      mediaUrl: url,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      fechaPublicacion: formData.fechaPublicacion
        ? new Date(formData.fechaPublicacion).toISOString()
        : null,

      fechaExpiracion: formData.fechaExpiracion
        ? new Date(formData.fechaExpiracion).toISOString()
        : null,
    };

    onSubmit(payload);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
        }}
      >
        <Stack spacing={2}>
          {/* ================================================================ */}
          {/* INFORMACIÓN GENERAL                                             */}
          {/* ================================================================ */}

          <FormSection
            title="Información general"
            description="Datos principales del contenido."
          >
            <Grid container spacing={1.75}>
              {/* Título */}
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Título"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                />
              </Grid>

              {/* Tipo */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  {TIPOS.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Categoría */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Categoría"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                />
              </Grid>

              {/* Descripción */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  maxRows={5}
                  size="small"
                  label="Descripción detallada"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </FormSection>

          {/* ================================================================ */}
          {/* CONTENIDO MULTIMEDIA                                            */}
          {/* ================================================================ */}

          <FormSection
            title="Contenido multimedia"
            description="Imagen o video que acompaña la publicación."
          >
            <Grid
              container
              spacing={1.75}
              alignItems="center"
            >
              {/* Tipo de media */}
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de media"
                  name="tipoMedia"
                  value={formData.tipoMedia}
                  onChange={handleChange}
                >
                  {TIPOS_MEDIA.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Subir archivo y vista previa */}
              <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <MediaUploader
                    type={formData.tipoMedia}
                    onUploadComplete={handleUploadComplete}
                  />

                  {formData.mediaUrl && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {formData.tipoMedia === 'IMAGEN' && (
                        <Box
                          component="img"
                          src={formData.mediaUrl}
                          alt="Vista previa"
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontWeight: 600, fontSize: '0.825rem' }}
                      >
                        Archivo cargado correctamente
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </FormSection>

          {/* ================================================================ */}
          {/* PUBLICACIÓN                                                      */}
          {/* ================================================================ */}

          <FormSection
            title="Publicación"
            description="Controla cuándo y cómo se muestra el contenido."
          >
            <Grid
              container
              spacing={1.75}
              alignItems="center"
            >
              {/* Estado */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  {ESTADOS.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Destacado */}
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 40,
                }}
              >
                <FormControlLabel
                  sx={{
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                    },
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.destacado}
                      onChange={handleChange}
                      name="destacado"
                    />
                  }
                  label="Marcar como destacado"
                />
              </Grid>

              {/* Fecha publicación */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DateField
                  label="Fecha de publicación"
                  name="fechaPublicacion"
                  value={formData.fechaPublicacion}
                  onChange={handleChange}
                />
              </Grid>

              {/* Fecha expiración */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DateField
                  label="Fecha de expiración (opcional)"
                  name="fechaExpiracion"
                  value={formData.fechaExpiracion}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </FormSection>

          {/* ================================================================ */}
          {/* ACCIONES                                                         */}
          {/* ================================================================ */}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.25,
              pt: 0.5,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              sx={{
                minWidth: 110,
                height: 40,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                minWidth: 160,
                height: 40,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Guardar contenido
            </Button>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}