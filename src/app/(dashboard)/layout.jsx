import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * src/app/(dashboard)/layout.jsx
 *
 * Layout compartido por todas las rutas del área autenticada
 * (/home, /sig/*, /rrhh/*, /ayuda, /nosotros...). Reemplaza el
 * envoltorio #root/#nav que el PHP repetía en cada página.
 *
 * La verificación de sesión ("si no hay usuario, redirigir") vive en
 * useAuth(), consumido dentro de los componentes cliente del árbol
 * (Header, WelcomeCard, etc.), no aquí — este layout es Server
 * Component y no puede usar hooks de cliente. Si se prefiere una
 * redirección más temprana (antes de pintar nada), la alternativa es
 * validar la cookie de sesión en un middleware.js de Next.js, pero
 * eso depende del mecanismo real de auth (ver TODO AUTH).
 */
export default function DashboardRouteLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
