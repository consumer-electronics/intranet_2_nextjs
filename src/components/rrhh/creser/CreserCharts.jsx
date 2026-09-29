'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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
    LabelList,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const COLORS_PIE = ['#ef5350', '#42a5f5']; // Pendientes = rojo, Completados = azul
const COLORS_BAR = ['#1565c0', '#0288d1', '#00897b', '#558b2f'];

/* ---------- Helpers ---------- */

const toTitleCase = (str = '') =>
    str
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

const truncate = (str = '', max = 14) =>
    str.length > max ? `${str.slice(0, max - 1)}…` : str;

/** Tarjeta contenedora común para todas las gráficas */
function ChartCard({ titulo, subtitulo, children }) {
    return (
        <Paper
            variant="outlined"
            sx={{ p: 1.5, borderRadius: 2, height: '100%', textAlign: 'center' }}
        >
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                {titulo}
            </Typography>
            {subtitulo && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {subtitulo}
                </Typography>
            )}
            {children}
        </Paper>
    );
}

/* ---------- Gráfica de torta ---------- */

/**
 * Props:
 *  - titulo    {string}  Título del gráfico
 *  - subtitulo {string}  Ej: "Personas 45"
 *  - datos     {Array}   [{ name: string, value: number }]
 */
export function CreserPieChart({ titulo, subtitulo, datos }) {
    const theme = useTheme();

    if (!datos || datos.every((d) => d.value === 0)) return null;

    const total = datos.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <ChartCard titulo={titulo} subtitulo={subtitulo}>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={datos}
                        cx="50%"
                        cy="45%"
                        innerRadius="45%"   // porcentajes: se adaptan al ancho disponible
                        outerRadius="75%"
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                            if (!value || total === 0) return null;
                            const RAD = Math.PI / 180;
                            const r = innerRadius + (outerRadius - innerRadius) / 2;
                            const x = cx + r * Math.cos(-midAngle * RAD);
                            const y = cy + r * Math.sin(-midAngle * RAD);
                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="#fff"
                                    fontSize={11}
                                    fontWeight={700}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                >
                                    {`${((value / total) * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {datos.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS_PIE[index % COLORS_PIE.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => {
                            const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                            return [`${value} (${percent}%)`, name];
                        }}
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 6,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

/* ---------- Gráfica de barras ---------- */

/**
 * Props:
 *  - titulo     {string}    Título del gráfico
 *  - subtitulo  {string}    Ej: "Personas 30"
 *  - categorias {string[]}  Nombres de las competencias en X
 *  - valores    {number[]}  Valores en % para cada categoría
 */
export function CreserBarChart({ titulo, subtitulo, categorias, valores }) {
    const theme = useTheme();

    if (!categorias || categorias.length === 0) return null;

    const data = categorias.map((cat, i) => ({
        fullName: toTitleCase(cat),
        name: truncate(toTitleCase(cat), 20),
        valor: Number((Number(valores?.[i] ?? 0)).toFixed(1)),
    }));

    const maxValor = Math.max(...data.map((d) => d.valor), 100);
    const height = Math.max(160, data.length * 44 + 30); // crece según # de competencias

    return (
        <ChartCard titulo={titulo} subtitulo={subtitulo}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[0, Math.ceil(maxValor / 10) * 10]}
                        unit="%"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                        formatter={(val) => [`${val}%`, 'Porcentaje']}
                        contentStyle={{
                            fontSize: 11,
                            borderRadius: 6,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((_, index) => (
                            <Cell
                                key={`bar-${index}`}
                                fill={COLORS_BAR[index % COLORS_BAR.length]}
                            />
                        ))}
                        <LabelList
                            dataKey="valor"
                            position="right"
                            formatter={(v) => `${v}%`}
                            style={{ fontSize: 10, fontWeight: 600 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

/* ---------- Panel: 2 ruedas arriba, 2 barras abajo ---------- */

/**
 * Props:
 *  - pies {Array}  Exactamente las 2 ruedas:
 *      [{ titulo, subtitulo, datos }, { titulo, subtitulo, datos }]
 *  - bars {Array}  Las 2 barras (Desempeño y Líderes):
 *      [{ titulo, subtitulo, categorias, valores }, { ... }]
 *
 * Ejemplo:
 *  <CreserChartsPanel
 *    pies={[
 *      { titulo: 'Desempeño', subtitulo: 'Personas 45', datos: datosDesempeno },
 *      { titulo: 'Líderes',   subtitulo: 'Personas 12', datos: datosLideres },
 *    ]}
 *    bars={[
 *      { titulo: 'Desempeño', subtitulo: 'Personas 45', categorias: catDes, valores: valDes },
 *      { titulo: 'Líderes',   subtitulo: 'Personas 12', categorias: catLid, valores: valLid },
 *    ]}
 *  />
 */
export function CreserChartsPanel({ pies = [], bars = [] }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
            {/* Fila superior: 2 ruedas lado a lado (también en móvil) */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1.5,
                }}
            >
                {pies.slice(0, 2).map((p, i) => (
                    <CreserPieChart key={`pie-${i}`} {...p} />
                ))}
            </Box>

            {/* Filas inferiores: 1 barra debajo de otra */}
            {bars.slice(0, 2).map((b, i) => (
                <CreserBarChart key={`bar-${i}`} {...b} />
            ))}
        </Box>
    );
}