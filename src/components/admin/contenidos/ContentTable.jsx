'use client';

import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Chip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ContentTable({ contents, onEdit, onPreview }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'grey.100' }}>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Orden</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell component="th" scope="row">
                {row.titulo}
                {row.destacado && <Chip label="Destacado" size="small" color="secondary" sx={{ ml: 1, height: 20 }} />}
              </TableCell>
              <TableCell>{row.tipo}</TableCell>
              <TableCell>{row.categoria}</TableCell>
              <TableCell>
                <Chip 
                  label={row.estado} 
                  size="small"
                  color={row.estado === 'PUBLICADO' ? 'success' : row.estado === 'BORRADOR' ? 'default' : 'warning'}
                />
              </TableCell>
              <TableCell align="center">{row.orden}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onPreview(row)} size="small" title="Previsualizar">
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => onEdit(row)} size="small" title="Editar" color="primary">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {contents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No hay contenidos registrados.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
