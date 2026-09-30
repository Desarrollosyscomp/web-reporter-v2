# Web Reports API

API REST multi-tenant para consultar ventas, cartera, inventario, arqueos de caja y almacenes de bases de datos MySQL de clientes. Está construida con NestJS y TypeScript; PostgreSQL mantiene la autenticación y la configuración que permite localizar cada base de datos del cliente.

## Documentación

- [Arquitectura y flujo](docs/ARQUITECTURA.md)
- [API HTTP](docs/API.md)
- [Datos, configuración y operación](docs/OPERACION.md)

## Requisitos

- Node.js y npm compatibles con las dependencias declaradas en `package.json`.
- Acceso a PostgreSQL de configuración y acceso de red a las bases MySQL de clientes.
- El módulo de caché está registrado globalmente. En la configuración actual no se configura un almacén Redis.

## Instalación y ejecución

```bash
npm install
npm run start:dev
```

Comandos principales:

```bash
npm run build       # compila a dist
npm run start       # inicia NestJS
npm run start:dev   # modo watch
npm run start:prod  # ejecuta dist/main
npm test            # pruebas unitarias
npm run test:e2e    # pruebas e2e, si están configuradas
```

La aplicación escucha en `API_PORT` o, por defecto, en el puerto `3200`. Swagger UI está disponible en `/api/v1/docs`.

## Configuración

Configura las variables de entorno descritas en [Operación](docs/OPERACION.md). No guardes credenciales reales en el repositorio. Todas las rutas de negocio requieren `Authorization: Bearer <token>`, excepto `POST /login/auth`. Las fechas `init_date`/`end_date` usan `YYYYMMDD`; consulta [API](docs/API.md) para los parámetros y respuestas.

## Pruebas

Hay pruebas unitarias en `src/**/*.spec.ts` para parte de los servicios y controladores. No cubren por sí solas todos los endpoints, consultas SQL ni la integración con los motores de base de datos.
