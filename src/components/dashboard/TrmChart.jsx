'use client';

import React from 'react';
import { Box, useTheme, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 1.5, minWidth: 120 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {data.fecha}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          ${data.valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
        </Typography>
      </Paper>
    );
  }

  return null;
};

export default function TrmChart({ data, isUp }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No hay datos para graficar</Typography>
      </Box>
    );
  }

  // Calculate min and max for YAxis to add some padding
  const values = data.map(d => d.valor);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const domainPadding = (maxVal - minVal) * 0.1 || 50;

  const lineColor = isUp ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Box sx={{ width: '100%', height: 170 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis 
            dataKey="fecha" 
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={[minVal - domainPadding, maxVal + domainPadding]} 
            hide={true} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: theme.palette.text.disabled, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke={lineColor} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, stroke: theme.palette.background.paper, strokeWidth: 2 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
