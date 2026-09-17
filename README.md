# Intranet Next

Proyecto de modernización y migración de la intranet de la empresa desde PHP hacia una arquitectura moderna basada en Next.js. 

Este repositorio contiene la nueva versión de la intranet, diseñada para ser rápida, mantenible, escalable y con una interfaz de usuario renovada utilizando las mejores prácticas de desarrollo web.

## Stack Tecnológico

El proyecto está construido utilizando las siguientes tecnologías:

- **Framework:** Next.js 16 (App Router)
- **Librería UI:** React
- **Lenguaje:** JavaScript / JSX (No TypeScript)
- **Estilos y Componentes:** Material UI (MUI) con Emotion (No se utiliza Tailwind ni Bootstrap)
- **Gestor de paquetes:** pnpm

## Arquitectura y Estructura del Proyecto

El proyecto sigue una estructura limpia y modularizada para separar las responsabilidades:

- `src/app/`: Contiene las rutas de la aplicación utilizando el App Router de Next.js.
  - Las rutas siguen la convención de internacionalización y layouts (ej. `src/app/[lang]/(dashboard)/...`).
  - Los archivos `page.jsx` se mantienen pequeños, delegando la lógica a componentes y servicios.
  - `src/app/api/`: Contiene los Route Handlers para endpoints de backend o BFF (Backend for Frontend).
- `src/components/`: Componentes de UI reutilizables y aislados.
- `src/hooks/`: Custom hooks de React para lógica reutilizable.
- `src/api/`: Lógica centralizada para las llamadas externas a las APIs (utilizando `fetch` nativo).
- `src/services/`: Lógica de negocio compleja separada de la UI.

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno local:

- Node.js (versión recomendada 18.x o superior)
- pnpm (gestor de paquetes recomendado para este proyecto)

## Instalación y Ejecución

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Reglas y Convenciones de Desarrollo

Para mantener la consistencia, calidad y seguridad del código, todos los desarrolladores deben seguir estas reglas:

### Migración desde PHP
- Se debe analizar primero el código PHP existente.
- No modificar el comportamiento funcional original sin documentarlo ni indicarlo.
- Mantener rutas y funcionalidades equivalentes.
- Identificar dependencias, endpoints, parámetros, permisos y estados.
- Separar la lógica PHP en componentes, hooks, servicios y APIs según corresponda.

### Componentes y UI
- Utilizar exclusivamente **Material UI (MUI)**.
- Reutilizar el archivo de tema (`theme.js`) existente. No crear colores corporativos aislados o estilos inline innecesarios.
- Crear componentes pequeños, reutilizables y evitar los componentes monolíticos.
- Usar la directiva `"use client"` únicamente cuando sea estrictamente necesario (manejo de estado, hooks de react, eventos del navegador).
- Garantizar que todos los componentes sean completamente responsivos y accesibles.

### Llamadas a la API
- Utilizar el `fetch` nativo de JavaScript. No instalar `axios`.
- Mantener los endpoints y llamadas centralizados en el directorio `src/api/`.
- No inventar nuevos endpoints ni estructuras de respuesta. Revisar las APIs existentes antes de proponer cambios.
- Manejar adecuadamente los estados de carga (loading), errores y estados vacíos.

### Seguridad
- Nunca exponer credenciales, tokens o secretos en componentes del cliente (`"use client"`).
- No manipular directamente las cookies de sesión desde los componentes.
- Operaciones sensibles deben pasar obligatoriamente por APIs protegidas.
- Siempre validar y sanitizar los datos de entrada en el servidor antes de procesarlos.

## Contribución

Antes de realizar cambios, por favor:
1. Revisa la estructura y componentes existentes para fomentar la reutilización de código.
2. Evita crear archivos innecesarios.
3. Asegúrate de que las rutas coincidan con la estructura esperada del App Router.
4. Soluciona cualquier *warning* emitido por React o MUI en la consola antes de enviar tus cambios.
