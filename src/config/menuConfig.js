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
 * `key` se usa para expandir/colapsar grupos y para un futuro
 * filtrado por permisos (ver sección "Roles y permisos" pendiente,
 * TODO más abajo). `href` ya apunta a rutas Next.js, no a los
 * data-href del PHP (paginas/... .php) ni al iframe.
 *
 * TODO PERMISOS:
 * Se requiere conocer la estructura actual de permisos/roles para
 * filtrar este menú por usuario. Por ahora se muestran todos los
 * items a cualquier usuario autenticado, igual que hace hoy el PHP
 * (que no filtra el <ul id="menu"> por rol).
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
  },
  {
    key: 'sig',
    label: 'SIG',
    icon: AssignmentIcon,
    children: [
      { key: 'sig-info-doc', label: 'Info Documentada', icon: DescriptionIcon, href: '/sig/info-documentada' },
      { key: 'sig-doc-interes', label: 'Doc de interés', icon: ArticleIcon, href: '/sig/documentos-interes' },
      { key: 'sig-info-general', label: 'Info de interés general', icon: InfoIcon, href: '/sig/info-interes-general' },
      { key: 'sig-politicas', label: 'Políticas', icon: PolicyIcon, href: '/sig/politicas' },
    ],
  },
  {
    key: 'rrhh',
    label: 'RRHH',
    icon: GroupsIcon,
    children: [
      { key: 'rrhh-biometrico', label: 'Biométrico', icon: FingerprintIcon, href: '/rrhh/biometrico' },
      { key: 'rrhh-solicitudes', label: 'Solicitudes', icon: EventNoteIcon, href: '/rrhh/solicitudes' },
      { key: 'rrhh-sala-juntas', label: 'Sala de juntas', icon: MeetingRoomIcon, href: '/rrhh/sala-juntas' },
      { key: 'rrhh-creser', label: 'CreSer', icon: SchoolIcon, href: '/rrhh/creser' },
      { key: 'rrhh-certificado', label: 'Certificado laboral', icon: DescriptionIcon, href: '/rrhh/certificado-laboral' },
      { key: 'rrhh-certificado-todos', label: 'Certificado laboral todos', icon: DescriptionIcon, href: '/rrhh/certificado-laboral-todos' },
      { key: 'rrhh-convenios-pereira', label: 'Convenios (Pereira)', icon: HandshakeIcon, href: '/rrhh/convenios' },
      { key: 'rrhh-convenios-nacional', label: 'Convenios (Nacional)', icon: PublicIcon, href: '/rrhh/convenios-nacional' },
      { key: 'rrhh-desprendibles', label: 'Desprendibles de nómina', icon: ReceiptLongIcon, href: '/rrhh/desprendibles' },
      { key: 'rrhh-reglamentos', label: 'Reglamentos', icon: GavelIcon, href: '/rrhh/reglamentos' },
      { key: 'rrhh-porteria', label: 'Portería', icon: SecurityIcon, href: '/rrhh/permisos-porteria' },
      { key: 'rrhh-admin-contenidos', label: 'Admin. Contenidos', icon: ArticleIcon, href: '/administracion/contenidos' },
    ],
  },
  {
    key: 'nosotros',
    label: 'Nosotros',
    icon: PeopleIcon,
    href: '/nosotros',
  },
  {
    key: 'ayuda',
    label: 'Ayuda',
    icon: HelpIcon,
    href: '/ayuda',
  },
];