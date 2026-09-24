'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import Header from './Header';
import Sidebar from './Sidebar';
import { AppPermissionsProvider } from '@/providers/AppPermissionsProvider';
import { useAuth } from '@/hooks/useAuth';

/**
 * src/components/layout/DashboardLayout.jsx
 *
 * Shell general del área autenticada. Reemplaza la estructura
 * #root > #nav (+ .nav-content) del PHP, pero sin el <iframe
 * id="object-contenido"> — el contenido de cada módulo sigue siendo
 * `children`, resuelto por el App Router (nada de iframe como
 * arquitectura de navegación).
 *
 * Además de `mobileOpen` (Drawer temporal en mobile), ahora coordina
 * `sidebarExpanded`: el Sidebar decide por sí mismo cuándo está
 * expandido (hover o fijado, ver Sidebar.jsx) y lo reporta aquí vía
 * `onExpandedChange`. Ese único valor booleano es lo que permite que
 * el Header calcule su offset y que el layout general no salte ni se
 * superponga cuando el Sidebar cambia de ancho.
 *
 * El área principal no necesita `margin-left` manual: al ser el
 * Sidebar un elemento en el flujo flex (ver el Box `component="nav"`
 * dentro de Sidebar.jsx), el contenido se reacomoda solo cuando ese
 * ancho cambia. Solo el Header, al ser `position: fixed`, necesita
 * que se le indique el ancho vigente.
 *
 * AppPermissionsProvider se monta aquí para que los permisos de módulos
 * se carguen en cuanto el usuario entra al área autenticada y queden
 * cacheados en memoria durante toda la sesión de cliente. Esto permite
 * que el Sidebar filtre los ítems sin parpadeos ni re-fetches.
 */
export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { user } = useAuth();

  const drawerWidth = theme.custom?.drawerWidth ?? 272;
  const collapsedWidth = theme.custom?.drawerWidthCollapsed ?? 72;
  const sidebarWidth = sidebarExpanded ? drawerWidth : collapsedWidth;

  const handleExpandedChange = useCallback((expanded) => {
    setSidebarExpanded(expanded);
  }, []);

  return (
    <AppPermissionsProvider user={user}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header onMenuClick={() => setMobileOpen(true)} sidebarWidth={sidebarWidth} />

        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onExpandedChange={handleExpandedChange}
        />

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar "fantasma" para compensar el AppBar fixed, patrón estándar de MUI */}
          <Toolbar />
          <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1 }}>{children}</Box>
        </Box>
      </Box>
    </AppPermissionsProvider>
  );
}