'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Selector de alcance de la lista de personal.
 *
 * Reemplaza el botón toggle anterior por un ToggleButtonGroup que comunica
 * claramente que es un modo de visualización (filtro de alcance), no una acción.
 *
 * Props:
 *  - value    {'listaUsuario'|'listaUsuarioTodos'}  Modo activo.
 *  - onChange {function(nuevoModo)}                 Callback al cambiar.
 *  - visible  {boolean}                            Si false, no renderiza nada.
 *             (se pasa false cuando el usuario no tiene permiso de ver todos)
 *  - disabled {boolean}                            Deshabilita el control.
 */
export default function ScopeSelector({ value, onChange, visible = true, disabled = false }) {
    if (!visible) return null;

    const handleChange = (_event, nuevoValor) => {
        // ToggleButtonGroup puede devolver null si se hace clic en el ya activo
        // → se ignora para mantener siempre un valor seleccionado.
        if (!nuevoValor) return;
        onChange?.(nuevoValor);
    };

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}
            >
                Vista:
            </Typography>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                size="small"
                aria-label="Modo de visualización del personal"
                disabled={disabled}
                sx={{
                    '& .MuiToggleButton-root': {
                        px: 1.5,
                        py: 0.5,
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        gap: 0.5,
                        borderColor: 'divider',
                    },
                    '& .MuiToggleButton-root.Mui-selected': {
                        fontWeight: 600,
                    },
                }}
            >
                <ToggleButton
                    value="listaUsuarioTodos"
                    aria-label="Ver todo el personal"
                >
                    <GroupsIcon fontSize="small" />
                    Todos
                </ToggleButton>
                <ToggleButton
                    value="listaUsuario"
                    aria-label="Ver personal a cargo"
                >
                    <PersonIcon fontSize="small" />
                    Personal a cargo
                </ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    );
}
