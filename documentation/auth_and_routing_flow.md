# Arquitectura de Autenticación y Enrutamiento de la API

Este documento describe el flujo de comunicación entre el frontend (Next.js) y el backend (NestJS), con especial atención a la autenticación y el enrutamiento de la API.

## Resumen de la Estrategia

La comunicación entre el frontend y el backend se realiza mediante **peticiones CORS directas** desde el navegador. **No se utiliza el sistema de proxy o `rewrites` de Next.js.**

Esta estrategia se basa en dos pilares fundamentales:

1.  **Doble Cliente de API en el Frontend**: El frontend utiliza dos instancias de `axios` configuradas para apuntar a diferentes `baseURL`.
2.  **Prefijo Global con Exclusión en el Backend**: El backend aplica un prefijo `/api` a todas sus rutas, excepto a las relacionadas con la autenticación.

---

## Flujo Detallado

### 1. Configuración del Backend (`/backend`)

-   **`main.ts`**:
    -   Se establece un prefijo global para todas las rutas con `app.setGlobalPrefix('api')`.
    -   Se añade una regla de exclusión explícita para el controlador de autenticación: `exclude: [{ path: 'auth', method: RequestMethod.ALL }]`.
    -   Esto resulta en dos tipos de rutas en el backend:
        -   Rutas de API estándar: `http://localhost:3000/api/{recurso}` (ej. `/api/projects`, `/api/documents`).
        -   Rutas de autenticación: `http://localhost:3000/auth/{accion}` (ej. `/auth/profile`, `/auth/google`).
    -   Se habilita CORS con `app.enableCors()` para aceptar peticiones directas desde el dominio del frontend (`http://localhost:3001`).

### 2. Configuración del Frontend (`/metaphor-manager-front`)

-   **`next.config.js`**:
    -   La función `async rewrites()` ha sido **eliminada**. El servidor de Next.js ya no actúa como intermediario o proxy para las llamadas a la API.

-   **`src/lib/api.ts`**:
    -   Se definen y exportan dos clientes de `axios`:
        -   `api`: Es el cliente por defecto. Su `baseURL` está configurada a `http://localhost:3000/api`. Se utiliza para todas las peticiones a los recursos de la API estándar.
        -   `authApi`: Es un cliente específico para la autenticación. Su `baseURL` apunta a la raíz del backend, `http://localhost:3000`.

-   **`src/context/AuthContext.tsx`**:
    -   Para obtener el perfil del usuario, se utiliza el cliente `authApi` para hacer una petición `GET` a `/auth/profile`. La petición final que sale del navegador es `http://localhost:3000/auth/profile`.
    -   Para otras operaciones, como obtener datos de un proyecto, se utiliza el cliente `api` por defecto, que dirige las peticiones a `http://localhost:3000/api/...`.

## Conclusión

Este enfoque es robusto porque es explícito. No depende de reglas de reescritura que puedan ser ambiguas. Cada llamada a la API desde el frontend se dirige a una URL absoluta y correcta gracias a la configuración de `baseURL` en los clientes de `axios`, y el backend está preparado para recibir estas llamadas directas gracias a CORS. 