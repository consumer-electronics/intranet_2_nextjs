'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, Snackbar 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';

import ContentTable from './ContentTable';
import ContentForm from './ContentForm';
import ContentOrder from './ContentOrder';
import ContentPreview from './ContentPreview';
import { contentsApi } from '@/api/contents';

export default function ContentManager() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Views: 'LIST', 'FORM', 'ORDER'
  const [currentView, setCurrentView] = useState('LIST');
  const [editingContent, setEditingContent] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const showAlert = useCallback((message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  }, []);

  const handleCloseAlert = () => setAlert(prev => ({ ...prev, open: false }));

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentsApi.getAll();
      setContents(data);
    } catch (error) {
      showAlert('Error al cargar los contenidos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleCreate = () => {
    setEditingContent(null);
    setCurrentView('FORM');
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setCurrentView('FORM');
  };

  const handlePreview = (content) => {
    setPreviewContent(content);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingContent) {
        await contentsApi.update(editingContent.id, formData);
        showAlert('Contenido actualizado exitosamente');
      } else {
        await contentsApi.create(formData);
        showAlert('Contenido creado exitosamente');
      }
      fetchContents();
      setCurrentView('LIST');
    } catch (error) {
      showAlert('Error al guardar el contenido', 'error');
    }
  };

  const handleOrderSave = async (orderedList) => {
    try {
      await contentsApi.updateOrder(orderedList);
      showAlert('Orden actualizado exitosamente');
      fetchContents();
      setCurrentView('LIST');
    } catch (error) {
      showAlert('Error al actualizar el orden', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Contenido Corporativo
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        {currentView === 'LIST' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<SortIcon />} 
                onClick={() => setCurrentView('ORDER')}
                disabled={loading || contents.length === 0}
              >
                Reordenar
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleCreate}
              >
                Nuevo Contenido
              </Button>
            </Box>
            <ContentTable 
              contents={contents} 
              onEdit={handleEdit} 
              onPreview={handlePreview} 
            />
          </Box>
        )}

        {currentView === 'FORM' && (
          <ContentForm 
            initialData={editingContent}
            onSubmit={handleFormSubmit}
            onCancel={() => setCurrentView('LIST')}
          />
        )}

        {currentView === 'ORDER' && (
          <ContentOrder 
            contents={contents}
            onSave={handleOrderSave}
            onCancel={() => setCurrentView('LIST')}
          />
        )}
      </Paper>

      <ContentPreview 
        open={Boolean(previewContent)} 
        onClose={() => setPreviewContent(null)} 
        content={previewContent} 
      />

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
