'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import { useTheme } from '@mui/material/styles';

import { menuItems } from '@/config/menuConfig';

/**
 * src/components/layout/Sidebar.jsx
 *
 * Sidebar tipo "mini variant" (rail):
 * - Colapsado por defecto en desktop (solo iconos).
 * - Se expande al pasar el mouse (o al recibir foco por teclado).
 * - Botón de fijar/desfijar arriba; si está fijado permanece
 *   expandido y persiste en localStorage.
 * - `menuItems` (src/config/menuConfig.js) sigue siendo la única
 *   fuente de navegación; no se hardcodean rutas ni se duplica el
 *   menú aquí.
 *
 * El componente notifica su ancho "efectivo" (expandido/colapsado)
 * hacia arriba vía `onExpandedChange`, para que DashboardLayout
 * pueda sincronizar el offset del Header y así evitar que quede
 * superpuesto sobre el Sidebar.
 */

const PIN_STORAGE_KEY = 'ceg-intranet:sidebar-pinned';

function hasActiveChild(item, pathname) {
  return item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + '/')) ?? false;
}

function NavIcon({ Icon, active, showChildDot }) {
  return (
    <ListItemIcon
      sx={{
        justifyContent: 'center',
        position: 'relative',
        color: active ? 'primary.main' : 'text.secondary',
      }}
    >
      <Icon fontSize="small" />
      {showChildDot && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: -1,
            right: 6,
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: active ? 'primary.main' : 'text.disabled',
          }}
        />
      )}
    </ListItemIcon>
  );
}

function SidebarContent({ pathname, expanded, onNavigate }) {
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    menuItems.forEach((item) => {
      if (item.children && hasActiveChild(item, pathname)) {
        initial[item.key] = true;
      }
    });
    return initial;
  });

  // Si la ruta cambia (navegación programática, deep link, etc.),
  // aseguramos que el grupo dueño de la ruta activa quede abierto.
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children && hasActiveChild(item, pathname)) {
        setOpenGroups((prev) => (prev[item.key] ? prev : { ...prev, [item.key]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%', py: 1 }}>
      <List component="nav" disablePadding sx={{ px: 1 }}>
        {menuItems
          .filter((item) => !item.hidden)
          .map((item) => {
            const Icon = item.icon;

            /* ITEM CON HIJOS */
            if (item.children) {
              const childActive = hasActiveChild(item, pathname);
              const isOpen = expanded && (openGroups[item.key] ?? false);
              const visibleChildren = item.children.filter((child) => !child.hidden);

              const parentButton = (
                <ListItemButton
                  onClick={expanded ? () => toggleGroup(item.key) : undefined}
                  selected={childActive}
                  aria-expanded={expanded ? isOpen : undefined}
                  sx={{ justifyContent: expanded ? 'flex-start' : 'center', px: expanded ? 2 : 1.5 }}
                >
                  <NavIcon Icon={Icon} active={childActive} showChildDot={!expanded} />

                  {expanded && (
                    <>
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { noWrap: true } }}
                        sx={{ ml: 1 }}
                      />
                      {isOpen ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </>
                  )}
                </ListItemButton>
              );

              return (
                <Box key={item.key}>
                  {expanded ? (
                    parentButton
                  ) : (
                    <Tooltip title={item.label} placement="right">
                      {parentButton}
                    </Tooltip>
                  )}

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        const selected = pathname === child.href || pathname.startsWith(child.href + '/');

                        return (
                          <ListItemButton
                            key={child.key}
                            component={Link}
                            href={child.href}
                            selected={selected}
                            onClick={onNavigate}
                          >
                            <NavIcon Icon={ChildIcon} active={selected} />
                            {/* IMPORTANTE: aquí debe ser child.label, no item.label */}
                            <ListItemText
                              primary={child.label}
                              slotProps={{ primary: { noWrap: true } }}
                              sx={{ ml: 1 }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            /* ITEM SIMPLE */
            const selected = pathname === item.href || pathname.startsWith(item.href + '/');
            const simpleButton = (
              <ListItemButton
                component={Link}
                href={item.href}
                selected={selected}
                onClick={onNavigate}
                sx={{ justifyContent: expanded ? 'flex-start' : 'center', px: expanded ? 2 : 1.5 }}
              >
                <NavIcon Icon={Icon} active={selected} />
                {expanded && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { noWrap: true } }}
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <Box key={item.key}>
                {expanded ? (
                  simpleButton
                ) : (
                  <Tooltip title={item.label} placement="right">
                    {simpleButton}
                  </Tooltip>
                )}
              </Box>
            );
          })}
      </List>
    </Box>
  );
}

function BrandMark({ expanded, showTitle = true }) {
  return (
    <Box
      component={Link}
      href="/home"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
        color: 'inherit',
        minWidth: 0,
        flexGrow: expanded ? 1 : 0,
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.9,
        },
      }}
    >
      <Box
        component="img"
        src="/images/logos/logo.png"
        alt="Logo Intranet"
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          objectFit: 'contain',
        }}
      />
      {expanded && showTitle && (
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap sx={{ flexGrow: 1 }}>
          Intranet
        </Typography>
      )}
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose, onExpandedChange }) {
  const theme = useTheme();
  const pathname = usePathname();

  const drawerWidth = theme.custom?.drawerWidth ?? 272;
  const collapsedWidth = theme.custom?.drawerWidthCollapsed ?? 72;

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const expanded = pinned || hovered;

  // La lectura de localStorage se hace después del montaje para no
  // provocar un mismatch de hidratación (SSR siempre arranca colapsado).
  useEffect(() => {
    setMounted(true);
    try {
      if (window.localStorage.getItem(PIN_STORAGE_KEY) === 'true') {
        setPinned(true);
      }
    } catch {
      // localStorage no disponible (modo privado, SSR, etc.): se ignora,
      // el Sidebar simplemente no persiste el estado fijado.
    }
  }, []);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  const togglePinned = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(PIN_STORAGE_KEY, String(next));
      } catch {
        // se ignora si no hay localStorage disponible
      }
      return next;
    });
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  // Soporte de teclado: sin hover, un usuario que navega con Tab no
  // vería las etiquetas si el rail permanece colapsado.
  const handleFocusCapture = useCallback(() => setHovered(true), []);
  const handleBlurCapture = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHovered(false);
    }
  }, []);

  const currentWidth = expanded ? drawerWidth : collapsedWidth;

  const widthTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: expanded
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  });

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{
        width: { md: currentWidth },
        flexShrink: { md: 0 },
        transition: { md: mounted ? widthTransition : 'none' },
      }}
    >
      {/* ==========================================
          MOBILE — Drawer temporal, siempre expandido
          ========================================== */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar sx={{ gap: 1.5, px: 2 }}>
          <BrandMark expanded />
        </Toolbar>
        <Divider />
        <SidebarContent pathname={pathname} expanded onNavigate={onMobileClose} />
      </Drawer>

      {/* ==========================================
          DESKTOP — rail mini con hover / fijado
          ========================================== */}

      <Drawer
        variant="permanent"
        open
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        sx={{
          display: { xs: 'none', md: 'block' },
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: currentWidth,
            overflowX: 'hidden',
            boxSizing: 'border-box',
            transition: mounted ? widthTransition : 'none',
          },
        }}
      >
        <Toolbar sx={{ gap: 1.5, px: expanded ? 2 : 1, justifyContent: expanded ? 'flex-start' : 'center' }}>
          <BrandMark expanded showTitle />

          {expanded && (
            <Tooltip title={pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral'}>
              <IconButton
                size="small"
                onClick={togglePinned}
                aria-label={pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral'}
                aria-pressed={pinned}
                color={pinned ? 'primary' : 'default'}
              >
                {pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
        <Divider />
        <SidebarContent pathname={pathname} expanded={expanded} />
      </Drawer>
    </Box>
  );
}