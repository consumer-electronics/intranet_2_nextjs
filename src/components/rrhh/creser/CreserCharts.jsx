'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const COLORS_PIE = ['#ef5350', '#42a5f5']; // Pendientes=rojo, Completados=azul

/**
 * Gráfica de torta (pie chart) para mostrar Pendientes vs Completados.
 *
 * Props:
 *  - titulo   {string}   Título del gráfico
 *  - subtitulo {string}  Subtítulo (ej: "Personas 45")
 *  - datos    {Array}    [{ name: string, value: number }]
 */
export function CreserPieChart({ titulo, subtitulo, datos }) {
    const theme = useTheme();

    if (!datos || datos.every((d) => d.value === 0)) return null;

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" fontWeight={700} display="block">
                {titulo}
            </Typography>
            {subtitulo && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {subtitulo}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={datos}
                        cx="50%"
                        cy="55%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                    >
                        {datos.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS_PIE[index % COLORS_PIE.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => [`${value}`, name]}
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 6,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 10 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}

const COLORS_BAR = ['#1565c0', '#0288d1', '#00897b', '#558b2f'];

/**
 * Gráfica de barras para mostrar % de competencias.
 *
 * Props:
 *  - titulo   {string}    Título del gráfico
 *  - subtitulo {string}   Ej: "Personas 30"
 *  - categorias {string[]} Nombres de las competencias en X
 *  - valores  {number[]}  Valores en % para cada categoría
 */
export function CreserBarChart({ titulo, subtitulo, categorias, valores }) {
    const theme = useTheme();

    if (!categorias || categorias.length === 0) return null;

    const data = categorias.map((cat, i) => ({
        name: cat
            .toLowerCase()
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
        valor: Number(valores[i] ?? 0),
    }));

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" fontWeight={700} display="block">
                {titulo}
            </Typography>
            {subtitulo && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {subtitulo}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={data}
                    margin={{ top: 16, right: 8, left: 0, bottom: 40 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 8 }}
                        angle={-15}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        unit="%"
                        tick={{ fontSize: 9 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        formatter={(val) => [`${val}%`, 'Porcentaje']}
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 6,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 8, formatter: (v) => `${v}%` }}>
                        {data.map((_, index) => (
                            <Cell
                                key={`bar-${index}`}
                                fill={COLORS_BAR[index % COLORS_BAR.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}
