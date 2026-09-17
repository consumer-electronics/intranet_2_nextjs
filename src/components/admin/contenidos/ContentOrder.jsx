'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, List, ListItem, ListItemText, IconButton, Button, Paper, Typography 
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function ContentOrder({ contents, onSave, onCancel }) {
  const [orderedList, setOrderedList] = useState([]);

  useEffect(() => {
    // We only care about published/active items for ordering generally, 
    // but here we just order whatever is passed
    const sorted = [...contents].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    setOrderedList(sorted);
  }, [contents]);

  const moveUp = (index) => {
    if (index === 0) return;
    const newList = [...orderedList];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    setOrderedList(newList);
  };

  const moveDown = (index) => {
    if (index === orderedList.length - 1) return;
    const newList = [...orderedList];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    setOrderedList(newList);
  };

  const handleSave = () => {
    const payload = orderedList.map((item, index) => ({
      id: item.id,
      orden: index + 1
    }));
    onSave(payload);
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Utiliza las flechas para ajustar el orden de aparición en el dashboard.
      </Typography>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <List>
          {orderedList.map((item, index) => (
            <ListItem 
              key={item.id}
              divider={index !== orderedList.length - 1}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => moveUp(index)} disabled={index === 0}>
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => moveDown(index)} disabled={index === orderedList.length - 1}>
                    <ArrowDownwardIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText 
                primary={item.titulo} 
                secondary={`${item.tipo} - ${item.estado} ${item.destacado ? '(Destacado)' : ''}`} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Guardar Orden</Button>
      </Box>
    </Box>
  );
}
