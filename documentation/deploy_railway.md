# Despliegue de Backend (NestJS) en Railway

## 1. Requisitos previos
- Tener una cuenta en [Railway](https://railway.app/)
- Tener el código del backend en un repositorio de GitHub
- Tener acceso a una base de datos MongoDB llamada `metaphor-manager-prod` (puede estar en Railway o Atlas)

## 2. Variables de entorno necesarias
Crea un archivo `.env.production` (no lo subas a git) con:
```
MONGODB_URI=mongodb+srv://<usuario>:<password>@<host>/metaphor-manager-prod?retryWrites=true&w=majority
NODE_ENV=production
PORT=3000
```

## 3. Scripts de build y start
Asegúrate de tener en tu `package.json`:
```json
"scripts": {
  "build": "nest build",
  "start:prod": "node dist/main.js"
}
```

## 4. Despliegue en Railway
1. Sube tu código a GitHub.
2. En Railway, crea un nuevo proyecto y elige "Deploy from GitHub repo".
3. Agrega las variables de entorno en el panel de Railway (`MONGODB_URI`, `NODE_ENV`, `PORT`).
4. Railway ejecutará automáticamente los scripts de build y start.
5. Verifica los logs y la URL pública del backend.

## 5. Recomendaciones de optimización
- Elimina dependencias de desarrollo antes del build: `npm prune --production`
- Configura CORS en el backend para aceptar solo el dominio del frontend en producción.
- No subas archivos grandes ni `.env` a git.
- Usa `NODE_ENV=production` para optimizar el rendimiento.

## 6. Seguridad
- Nunca subas tus credenciales de base de datos a git.
- Usa variables de entorno para todo lo sensible.

---
¡Listo! Tu backend estará disponible en Railway y conectado a la base de datos `metaphor-manager-prod`. 