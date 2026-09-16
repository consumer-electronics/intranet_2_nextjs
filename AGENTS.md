# Reglas del proyecto - Intranet Next

## Stack

- Next.js 16 con App Router.
- React.
- JavaScript / JSX.
- Material UI (MUI).
- Emotion mediante MUI.
- pnpm.
- No TypeScript.
- No Tailwind.
- No Bootstrap.

## Arquitectura

- Utilizar App Router.
- Las rutas deben seguir la estructura:
  src/app/[lang]/(dashboard)/...
- Mantener page.jsx pequeño.
- La lógica debe estar fuera de page.jsx.
- Componentes reutilizables en src/components.
- Hooks en src/hooks.
- Llamadas API centralizadas en src/api.
- Route Handlers en src/app/api.
- Utilizar servicios cuando exista lógica de negocio compleja.
- Mantener separación entre UI, lógica y acceso a datos.

## API

- Utilizar fetch nativo.
- No utilizar axios.
- No inventar endpoints.
- No inventar estructuras de respuesta.
- Revisar primero los endpoints existentes antes de crear uno nuevo.
- Mantener las URLs/endpoints centralizados.
- Manejar correctamente loading, errores y estados vacíos.

## UI

- Utilizar exclusivamente Material UI.
- Utilizar el theme.js existente.
- No crear colores corporativos aislados.
- Evitar CSS innecesario.
- Preferir sx y theme de MUI.
- Mantener consistencia visual entre módulos.
- Todos los componentes deben ser responsive.
- Las tarjetas relacionadas deben mantener tamaños y alturas consistentes.
- Priorizar accesibilidad.

## Componentes

- Crear componentes reutilizables.
- Evitar componentes monolíticos.
- No duplicar lógica.
- Evitar use client cuando no sea necesario.
- Utilizar use client únicamente cuando el componente requiera estado,
  efectos, eventos del navegador o APIs del cliente.

## Migración PHP → Next.js

- Analizar primero el código PHP existente.
- No modificar el comportamiento funcional sin indicarlo.
- Mantener rutas y funcionalidades equivalentes.
- No inventar funcionalidades que no existan en el módulo original.
- Identificar dependencias, endpoints, parámetros, permisos y estados.
- Separar la lógica PHP en componentes, hooks, servicios y APIs según corresponda.
- Mantener temporalmente URLs existentes cuando sea necesario.
- Documentar cualquier comportamiento que no pueda reproducirse exactamente.

## Seguridad

- No exponer credenciales.
- No colocar secretos en componentes cliente.
- No manipular directamente cookies de sesión desde componentes.
- Las operaciones sensibles deben pasar por APIs protegidas.
- No confiar en datos enviados por el cliente.
- Validar entradas antes de procesarlas.

## Antes de modificar código

1. Revisar la estructura existente.
2. Buscar componentes similares.
3. Revisar el theme existente.
4. Revisar APIs existentes.
5. Reutilizar código cuando sea posible.
6. No crear archivos innecesarios.
7. No modificar archivos que no estén relacionados con la tarea.

## Entrega

Cuando se solicite código:

- Entregar archivos completos cuando sea necesario.
- Indicar claramente los archivos creados/modificados.
- No eliminar funcionalidades existentes.
- No introducir dependencias nuevas sin justificarlo.
- Verificar imports.
- Verificar que las rutas coincidan con App Router.
- Evitar warnings de React/MUI.