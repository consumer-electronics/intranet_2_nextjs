'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';

import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { menuItems } from '@/config/menuConfig';

/**
 * src/components/layout/Header.jsx
 *
 * Reemplaza el bloque .user-container (foto, nombre, botón "Salir")
 * y el mobileMenuButton del PHP.
 *
 * Cambios respecto a la versión anterior:
 * - Ya no es una AppBar de ancho completo superpuesta al Sidebar:
 *   recibe `sidebarWidth` (el ancho *actual* del Sidebar, colapsado
 *   o expandido) desde DashboardLayout y desplaza su `margin-left`/
 *   `width` para acoplarse exactamente al espacio libre, con la
 *   misma curva de transición que usa el Sidebar al expandirse.
 * - Se eliminó el título corporativo duplicado ("Consumer
 *   Electronics Group SAS"): el branding vive únicamente en el
 *   Sidebar. En su lugar el Header muestra la sección/página actual,
 *   derivada de `menuItems` (mismo config, sin rutas hardcodeadas ni
 *   duplicar el menú).
 * - El botón de menú (☰) solo se muestra en mobile y dispara
 *   `onMenuClick`, que DashboardLayout usa para abrir el Drawer
 *   temporal del Sidebar.
 * - El logout ya no manipula localStorage directamente (eso vivía
 *   en cerrarSesion() dentro del PHP) — delega en useAuth().logout(),
 *   que llama a src/api/auth.js. No se tocó esa lógica.
 */

function findPageTitle(pathname) {
  for (const item of menuItems) {
    if (pathname === item.href || pathname.startsWith(item.href + '/')) return item.label;
    if (item.children) {
      const child = item.children.find((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
      if (child) return child.label;
    }
  }
  return null;
}

export default function Header({ onMenuClick, sidebarWidth = 0 }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const pageTitle = useMemo(() => findPageTitle(pathname) ?? 'Inicio', [pathname]);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        ml: { md: `${sidebarWidth}px` },
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
        transition: theme.transitions.create(['margin-left', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600} noWrap sx={{ flexGrow: 1, fontSize: '1.05rem' }}>
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ThemeToggle />

          {user?.name && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {user.name}
            </Typography>
          )}

          <Tooltip title="Cuenta">
            <IconButton
              onClick={handleAvatarClick}
              size="small"
              aria-label="Abrir menú de cuenta"
              aria-controls={menuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <Avatar src={user?.foto || undefined} alt={user?.name || 'Usuario'} sx={{ width: 36, height: 36 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {user?.nombre && (
            <Box sx={{ px: 2, py: 1, maxWidth: 220 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {user.nombre}
              </Typography>
            </Box>
          )}
          {user?.nombre && <Divider />}

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Salir</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}