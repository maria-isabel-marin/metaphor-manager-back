# metaphor-data-manager - ES
Meta-CRUD App es una aplicación web para gestionar datos relacionados con expresiones metafóricas. Usa React en el frontend, Nest.js en el backend y MongoDB con Mongoose. Permite realizar operaciones CRUD y la importación masiva de datos desde archivos Excel. Es modular y escalable para futuras expansiones.

Este proyecto es producto de la investigación doctoral titulada "Can an AI-enabled system help us understand how cultural narratives are configured, and how do they prime social mobilization?". La aplicación está diseñada para ser modular y escalable, con la capacidad de integrar otras bases de datos en el futuro.

# metaphor-data-manager - EN

Meta-CRUD App is a web application designed to manage data related to metaphorical expressions. It uses React for the frontend, Nest.js for the backend, and MongoDB with Mongoose. It allows CRUD operations and the bulk import of data from Excel files. The app is modular and scalable for future expansions.

This project results from the doctoral research titled "Can an AI-enabled system help us understand how cultural narratives are configured, and how do they prime social mobilization?" The application is designed to be modular and scalable, with the ability to integrate other databases in the future.

# Local setup

Path:
metaphor-manager-back/backend

Create a .env file with:
MONGODB_URI=mongodb://127.0.0.1:27017/metaphor_manager
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CORS=http://localhost:3001   
PORT=3000  
NODE_ENV=development

GOOGLE_CLIENT_ID=  
GOOGLE_CLIENT_SECRET=  
GOOGLE_CALLBACK_URL=  

GCS_BUCKET=  
GOOGLE_APPLICATION_CREDENTIALS_JSON=  
Install dependencies:  
npm install  
Run the backend:  
npm run start:dev  

Backend runs on:  
http://localhost:3000

Notes:

MongoDB must be running before starting the backend.  
For local testing without Google OAuth credentials, Google authentication was temporarily disabled.
