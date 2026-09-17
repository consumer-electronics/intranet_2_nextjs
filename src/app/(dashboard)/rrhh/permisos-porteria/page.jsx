// src/app/[lang]/(dashboard)/rrhh/permisos-porteria/page.jsx
import PermisosPorteriaView from "@/components/rrhh/permisos-porteria/PermisosPorteriaView";

// TODO: reemplazar por el manejo real de metadata/diccionario i18n del proyecto ([lang]).
export const metadata = {
  title: 'Permisos aprobados | Portería',
};

export default function PermisosPorteriaPage() {
  return <PermisosPorteriaView />;
}
