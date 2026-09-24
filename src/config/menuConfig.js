import HomeIcon from '@mui/icons-material/HomeOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';
import FingerprintIcon from '@mui/icons-material/FingerprintOutlined';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoomOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import HandshakeIcon from '@mui/icons-material/HandshakeOutlined';
import PublicIcon from '@mui/icons-material/PublicOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import GavelIcon from '@mui/icons-material/GavelOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import PolicyIcon from '@mui/icons-material/PolicyOutlined';
import ArticleIcon from '@mui/icons-material/ArticleOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';

/**
 * src/config/menuConfig.js
 *
 * Estructura de navegación tomada 1:1 de los <li> del PHP actual
 * (id="menu" / id="apps" / id="pages"). Es la fuente única de
 * verdad del Sidebar: el componente Sidebar solo la recorre y
 * renderiza, no contiene los items escritos a mano.
 *
 * `key` se usa para expandir/colapsar grupos y para el filtrado
 * de permisos en AppPermissionsProvider / Sidebar.
 *
 * `permission` es el campo `mod_nombre` de la tabla `ceg_modulo`
 * en la BD de Dynamics. Si un ítem NO tiene `permission`, siempre
 * se muestra (ej: Inicio, Ayuda). Si tiene `permission`, solo se
 * muestra si el usuario tiene ese permiso activo (per_estado=1).
 *
 * Los `mod_nombre` fueron confirmados directamente del código PHP
 * fuente de Dynamics CEG revisando cada $acceso->acceso_modulo(...)
 * en los directorios de modulos/ correspondientes.
 *
 * Nota: "Porteria" existe en el PHP pero con la clase `d-none`
 * (oculto). Se conserva aquí con `hidden: true` para no perder la
 * información, pero no se renderiza hasta que se confirme su estado.
 */
export const menuItems = [
  {
    key: 'home',
    label: 'Inicio',
    icon: HomeIcon,
    href: '/home',
    // Sin `permission`: siempre visible para cualquier usuario autenticado
  },
  {
    key: 'sig',
    label: 'SIG',
    icon: AssignmentIcon,
    // El grupo SIG se muestra si al menos un hijo es visible.
    // permission: 'intranet_sig', // Eliminado para que sea dinámico según los hijos
    children: [
      {
        key: 'sig-info-doc',
        label: 'Info Documentada',
        icon: DescriptionIcon,
        href: '/sig/info-documentada',
        // Sin permission: mapa de procesos visible para todos
      },
      {
        key: 'sig-doc-interes',
        label: 'Documentos de interés general',
        icon: ArticleIcon,
        href: '/sig/documentos-interes',
        // Sin permission: visible para todos
      },
      {
        key: 'sig-info-general',
        label: 'Info de interés general',
        icon: InfoIcon,
        href: '/sig/info-interes-general',
        // Sin permission: visible para todos
      },
      {
        key: 'sig-politicas',
        label: 'Políticas',
        icon: PolicyIcon,
        href: '/sig/politicas',
        // Sin permission: visible para todos
      },
    ],
  },
  {
    key: 'rrhh',
    label: 'RRHH',
    icon: GroupsIcon,
    children: [
      {
        key: 'rrhh-biometrico',
        label: 'Biométrico',
        icon: FingerprintIcon,
        href: '/rrhh/biometrico'
      },
      {
        key: 'rrhh-solicitudes',
        label: 'Solicitudes',
        icon: EventNoteIcon,
        href: '/rrhh/solicitudes',
      },
      {
        key: 'rrhh-sala-juntas',
        label: 'Sala de juntas',
        icon: MeetingRoomIcon,
        href: '/rrhh/sala-juntas',
        // Sin permission: cualquier usuario autenticado puede ver y reservar.
        // El único permiso especial es 'sala_juntas_eliminar' (eliminar reservas
        // de otros usuarios), que se valida en /api/rrhh/sala-juntas/permiso-eliminar.
      },
      {
        key: 'rrhh-creser',
        label: 'CreSer',
        icon: SchoolIcon,
        href: '/rrhh/creser',
        permission: 'registros_creser', // mod_tipo='intranet', menu_fk=19
      },
      {
        key: 'rrhh-certificado',
        label: 'Certificado laboral',
        icon: DescriptionIcon,
        href: '/rrhh/certificado-laboral',
        permission: 'certificados_laborales', // mod_tipo='intranet', menu_fk=19
      },
      {
        key: 'rrhh-certificado-todos',
        label: 'Certificado laboral todos',
        icon: DescriptionIcon,
        href: '/rrhh/certificado-laboral-todos',
        permission: 'certificados_laborales',
      },
      {
        key: 'rrhh-convenios-pereira',
        label: 'Convenios (Pereira)',
        icon: HandshakeIcon,
        href: '/rrhh/convenios',
        // Sin permission: página informativa, sin restricción en PHP legacy
      },
      {
        key: 'rrhh-convenios-nacional',
        label: 'Convenios (Nacional)',
        icon: PublicIcon,
        href: '/rrhh/convenios-nacional',
        // Sin permission: página informativa, sin restricción en PHP legacy
      },
      {
        key: 'rrhh-desprendibles',
        label: 'Desprendibles de nómina',
        icon: ReceiptLongIcon,
        href: '/rrhh/desprendibles',
        // Sin permission: accesible a todos los funcionarios en PHP legacy
      },
      {
        key: 'rrhh-reglamentos',
        label: 'Reglamentos',
        icon: GavelIcon,
        href: '/rrhh/reglamentos',
        // Sin permission: página informativa, sin restricción en PHP legacy
      },
      {
        key: 'rrhh-porteria',
        label: 'Portería',
        icon: SecurityIcon,
        href: '/rrhh/permisos-porteria',
        permission: 'solicitud_permisos_porteria', // mod_tipo='intranet', menu_fk=19
      },
    ],
  },
  {
    key: 'nosotros',
    label: 'Nosotros',
    icon: PeopleIcon,
    href: '/nosotros',
    // Sin permission: página corporativa pública para todos los empleados
  },
  {
    key: 'ayuda',
    label: 'Ayuda',
    icon: HelpIcon,
    href: '/ayuda',
    // Sin permission: siempre visible
  },
];