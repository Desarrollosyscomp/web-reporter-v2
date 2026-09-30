# Datos, configuración y operación

## Variables de entorno

| Variable | Uso |
|---|---|
| `API_PORT` | Puerto HTTP; predeterminado `3200`. |
| `JWT_SECRET` | Secreto de firma/verificación del JWT; requerido. |
| `JWT_ALGORITHMS` | Algoritmo JWT para firma; requerido y válido según `jsonwebtoken`. |
| `POSTGRES_TYPE` | Tipo de driver de TypeORM, normalmente `postgres`. |
| `POSTGRES_HOST` | Host del catálogo de clientes. |
| `POSTGRES_PORT` | Puerto del catálogo PostgreSQL. |
| `POSTGRES_USERNAME` | Usuario del catálogo. |
| `POSTGRES_PASSWORD` | Clave del catálogo. |
| `POSTGRES_DATABASE` | Base del catálogo. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Valores predeterminados de `database.config.ts`; `DB_PORT` aporta el puerto a los pools MySQL de tenants (3306 por defecto). El host/base/usuario/clave del pool se obtienen del tenant resuelto. |

No hay archivo `.env.example` versionado. `ConfigModule` lee el entorno y los módulos de configuración de base también llaman `dotenv.config()`. `synchronize` y logging de TypeORM están desactivados.

## Modelo de datos de control (PostgreSQL)

Las entidades usan el esquema `public`:

- `clients`: `id`, `name`, `clientable_type`, `clientable_id`, `is_active`, datos tributarios y marcas temporales. Relación declarada uno a uno con las dos entidades siguientes.
- `conxpos_utilities_auth`: `client_id`, `database_ip`, `username`, `password`, `status` y metadatos. Se usa para login y para localizar el host MySQL. Login busca por `username`; resolver tenant filtra `status = 1`.
- `conxpos_utilities_databases`: `client_id`, `database_name`, `db_user`, `db_password`, `is_active` y metadatos. Resolver tenant filtra `is_active = true`.

Las entidades expresan relaciones TypeORM, pero `TenantDatabaseService` hace dos búsquedas por `client_id` y no exige una entidad `Client` activa. El middleware rellena el campo `req.tenant` para el adaptador MySQL.

## Modelo operativo MySQL

El código no define entidades TypeORM del esquema de reportes: accede mediante SQL a tablas del sistema de clientes. Por las consultas, aparecen entre otras:

- Ventas: `facturas`, `detfacturas`, `devventas`, `ordenes`, `pagos`, `detallepagos` (según informe).
- Catálogo e inventario: `productos`, `inventario`, `iva`, `almacenes`.
- Cartera: `cartera`, `detcartera`.

Los nombres de columnas y reglas de negocio están en `src/reports/reports.service.ts`; no se infiere aquí un ER completo que no esté declarado en el repositorio. `almacenes` también se consulta en `WarehousesService`.

## Pools y caché

Cada tenant usa un pool MySQL persistente en memoria del proceso. La clave del pool concatena `host`, `database` y `user`; el puerto es global (`DB_PORT`) y no se toma de cada tenant. El pool admite 20 conexiones, espera si está saturado y no limita la cola. Para cambiar credenciales en el catálogo, considera tanto la caché `tenant_<client_id>` como los pools estáticos; no existe en el código un mecanismo de invalidación explícito.

El cache-manager se registra con `ttl: 3600 * 1000` y `max: 500`, pero esa TTL podría interpretarse según la versión del almacén y `TenantDatabaseService.set` no especifica TTL. Verifica el comportamiento del store usado antes de depender de una duración concreta.

## Inicio, documentación y CORS

`main.ts` sirve HTTP en el puerto configurado/default, habilita CORS para cualquier origen con credenciales y permite GET/HEAD/PUT/PATCH/POST/DELETE/OPTIONS. Instala un interceptor de logging y ajusta los timeouts del servidor. Swagger persiste autorización entre sesiones del navegador; úsalo solo con tokens de desarrollo o en un entorno protegido.

## Mantenimiento y puntos a verificar

- JWT: el token establece `exp` como milisegundos y el middleware ignora la expiración. `JwtStrategy` configura validación estándar, pero los controladores están protegidos actualmente por middleware global. Alinear las unidades y la estrategia antes de asumir vencimiento efectivo.
- Tenant: claves de DB resueltas desde PostgreSQL se cachean; revisar invalidación ante cambios y validar que la selección corresponda a un tenant/licencia activa según las reglas del producto.
- Puerto MySQL: se toma de `DB_PORT`, mientras el catálogo almacena host, base y credenciales, no puerto por tenant.
- SQL de reportes: la semántica de fechas, almacenes y agregados es propia de cada método. Las decisiones sobre ventas y descuentos están reflejadas en casos de uso y consultas; comparar cambios con `SOLUTION_SUMMARY.md`.
- Pruebas: revisar/ejecutar `npm test` y pruebas de integración con bases representativas al cambiar consultas o transformaciones. El build se valida con `npm run build`.
