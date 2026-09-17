'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SortIcon from '@mui/icons-material/Sort';

export default function NosotrosHeader({
    totalUsers = 0,
    filteredCount = 0,
    departments = [],
    searchTerm = '',
    onSearchChange,
    selectedDepartment = 'all',
    onDepartmentChange,
    sortBy = 'name_asc',
    onSortChange,
    viewMode = 'grid',
    onViewModeChange,
}) {
    const hasActiveFilters =
        Boolean(searchTerm) || selectedDepartment !== 'all';

    return (
        <Stack
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}
        >
            {/* Banner institucional */}
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2.5,
                        sm: 3,
                        md: 4,
                    },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    background:
                        'linear-gradient(135deg, rgba(11, 92, 171, 0.04) 0%, rgba(21, 101, 192, 0.08) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Stack
                    direction={{
                        xs: 'column',
                        md: 'row',
                    }}
                    spacing={{ xs: 2.5, md: 3 }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: 'stretch',
                        md: 'center',
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mb: 1 }}
                        >
                            <Box
                                sx={{
                                    p: { xs: 0.8, sm: 1 },
                                    borderRadius: 2,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <PeopleIcon
                                    fontSize="small"
                                />
                            </Box>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="text.primary"
                                sx={{
                                    fontSize: {
                                        xs: '1.6rem',
                                        sm: '1.9rem',
                                        md: '2.125rem',
                                    },
                                }}
                            >
                                Nosotros
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                maxWidth: 720,
                                fontSize: {
                                    xs: '0.875rem',
                                    sm: '1rem',
                                },
                            }}
                        >
                            Conoce al equipo de colaboradores que impulsa el
                            crecimiento y propósito de nuestra organización.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <Chip
                            icon={<PeopleIcon />}
                            label={`${totalUsers} Colaboradores`}
                            color="primary"
                            variant="filled"
                            sx={{
                                fontWeight: 700,
                                minHeight: 40,
                            }}
                        />

                        <Chip
                            icon={<ApartmentIcon />}
                            label={`${departments.length} Dependencias`}
                            variant="outlined"
                            sx={{
                                fontWeight: 600,
                                minHeight: 40,
                                bgcolor: 'background.paper',
                            }}
                        />
                    </Stack>
                </Stack>
            </Paper>

            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                    },
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack spacing={1.5}>
                    <Stack
                        direction={{
                            xs: 'column',
                            lg: 'row',
                        }}
                        spacing={1.5}
                        alignItems={{
                            xs: 'stretch',
                            lg: 'center',
                        }}
                    >
                        {/* Búsqueda */}
                        <TextField
                            fullWidth
                            placeholder="Buscar por nombre, cargo, correo o usuario..."
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchChange?.(event.target.value)
                            }
                            size="small"
                            sx={{
                                flex: {
                                    lg: 1,
                                },
                                minWidth: 0,
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm ? (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    onSearchChange?.('')
                                                }
                                                aria-label="Limpiar búsqueda"
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : undefined,
                                },
                            }}
                        />

                        {/* Controles */}
                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1.5}
                            sx={{
                                width: {
                                    xs: '100%',
                                    lg: 'auto',
                                },
                            }}
                        >
                            <FormControl
                                size="small"
                                sx={{
                                    width: {
                                        xs: '100%',
                                        sm: 210,
                                        lg: 190,
                                    },
                                }}
                            >
                                <InputLabel id="select-dept-label">
                                    Dependencia
                                </InputLabel>

                                <Select
                                    labelId="select-dept-label"
                                    value={selectedDepartment}
                                    label="Dependencia"
                                    onChange={(event) =>
                                        onDepartmentChange?.(
                                            event.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="all">
                                        Todas las dependencias
                                    </MenuItem>

                                    {departments.map((department) => (
                                        <MenuItem
                                            key={department}
                                            value={department}
                                        >
                                            {department}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl
                                size="small"
                                sx={{
                                    width: {
                                        xs: '100%',
                                        sm: 175,
                                        lg: 165,
                                    },
                                }}
                            >
                                <InputLabel id="select-sort-label">
                                    Ordenar por
                                </InputLabel>

                                <Select
                                    labelId="select-sort-label"
                                    value={sortBy}
                                    label="Ordenar por"
                                    onChange={(event) =>
                                        onSortChange?.(
                                            event.target.value
                                        )
                                    }
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SortIcon
                                                fontSize="small"
                                                color="action"
                                            />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="name_asc">
                                        Nombre (A - Z)
                                    </MenuItem>

                                    <MenuItem value="name_desc">
                                        Nombre (Z - A)
                                    </MenuItem>

                                    <MenuItem value="dept">
                                        Dependencia
                                    </MenuItem>

                                    <MenuItem value="cargo">
                                        Cargo
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(_, nextView) => {
                                    if (nextView) {
                                        onViewModeChange?.(nextView);
                                    }
                                }}
                                size="small"
                                aria-label="Modo de visualización"
                                sx={{
                                    height: 40,
                                    alignSelf: {
                                        xs: 'flex-start',
                                        sm: 'center',
                                    },
                                }}
                            >
                                <ToggleButton
                                    value="grid"
                                    aria-label="Vista en cuadrícula"
                                >
                                    <GridViewIcon fontSize="small" />
                                </ToggleButton>

                                <ToggleButton
                                    value="list"
                                    aria-label="Vista en lista"
                                >
                                    <FormatListBulletedIcon fontSize="small" />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Stack>

                    {/* Filtros activos */}
                    {hasActiveFilters && (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                            sx={{
                                pt: 1.5,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    width: {
                                        xs: '100%',
                                        sm: 'auto',
                                    },
                                }}
                            >
                                Mostrando {filteredCount} resultados
                            </Typography>

                            {searchTerm && (
                                <Chip
                                    label={`Búsqueda: "${searchTerm}"`}
                                    size="small"
                                    onDelete={() =>
                                        onSearchChange?.('')
                                    }
                                />
                            )}

                            {selectedDepartment !== 'all' && (
                                <Chip
                                    label={`Depto: ${selectedDepartment}`}
                                    size="small"
                                    onDelete={() =>
                                        onDepartmentChange?.('all')
                                    }
                                />
                            )}
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}