# API HTTP

Base URL: `http://<host>:<API_PORT>` (por defecto `3200`). Swagger UI: `/api/v1/docs`.

Excepto el login, las rutas están detrás de `ValidationMiddleware`. Envía `Authorization: Bearer <token>`. Los DTO pasan por el pipe global: campos no declarados son rechazados y los tipos definidos con `@Type` se convierten.

## Autenticación

### `POST /login/auth`

Cuerpo JSON:

```json
{"username":"usuario","password":"contraseña"}
```

Compara la clave contra el hash bcrypt de PostgreSQL y devuelve un token firmado con el `client_id`. Respuesta normal: `{ "response": { "token": "..." }, "status": 200, "message": "Http Response", "name": "HttpResponse" }`. Errores de usuario/clave se mapean con `getHttpStatusLogin`.

## Almacenes

### `GET /warehouses`

Sin parámetros. Devuelve los almacenes con `activo = 1` para el tenant autenticado.

## Reportes

| Método y ruta | Parámetros | Descripción |
|---|---|---|
| `GET /reports/sales-day` | `init_date` requerido (`YYYYMMDD`) | Ventas agregadas por almacén para el día. Valida la fecha. |
| `GET /reports/sales-day/:date/:warehouse_id` | `date` (`YYYYMMDD`), `warehouse_id`; `page`, `limit` | Facturas del día y almacén, paginadas, con resumen y métodos de pago. |
| `GET /reports/invoice-detail/:warehouse_id/:invoice_number` | `warehouse_id`, `invoice_number` | Detalle y resumen de una factura. Valida que exista en el almacén. |
| `GET /reports/cumulative-sales` | `init_date`, `end_date` (`YYYYMMDD`), `page`, `limit`, `warehouse_id` | Ventas agregadas por fecha. En los comentarios de API, `warehouse_id=0` representa todos los almacenes. |
| `GET /reports/cash-counts` | `date` (`YYYY-MM-DD HH:mm:ss`), `warehouse_id` | Arqueo de caja de pedidos y facturas; valida fecha/almacén. |
| `GET /reports/receivable-portfolio` | `init_date`, `end_date`, `page`, `limit`, `warehouse_id` | Cuentas por cobrar (facturas y pedidos). |
| `GET /reports/payable-portfolio` | `init_date`, `end_date`, `page`, `limit`, `warehouse_id` | Cuentas por pagar (compras). |
| `GET /reports/inventory` | `warehouse_id`, `limit`, `page`; `search` opcional | Inventario paginado; busca descripción, código o barcode. `warehouse_id=0` consulta todos. |
| `GET /reports/dashboard/summary` | `init_date`, `end_date` opcionales en DTO | Ventas del día y resumen de cartera/últimos siete días; actualmente las fechas del DTO no se entregan al caso de uso. |

Los query params de cartera y ventas acumuladas se reciben mediante `GetReportDto`, cuyos campos son obligatorios. Para ejemplos actualizados de esquemas y códigos HTTP, consulta Swagger.

## Respuesta y paginación

Las rutas de reportes y almacenes envuelven el resultado con `HttpResponse`:

```json
{"response":{"...":"datos"},"status":200,"message":"Http Response","name":"HttpResponse"}
```

En informes paginados, `response` normalmente tiene `list`, `count`, `totalPages` y `summary`. `totalPages` se calcula como `ceil(count / limit)`. En endpoints con validación previa, el error usa un cuerpo `HttpException`; para autenticación, el middleware responde con `{statusCode, message}`.

Los códigos HTTP reales se obtienen de `src/*/helpers/*http-status.ts`; el `status` lógico del envelope y el HTTP no son la misma cosa. Los valores exactos de `summary`/`list` dependen de la consulta; las transformaciones principales (ventas, inventario, factura y dashboard) están descritas en sus casos de uso en `src/reports/use-cases/`.

## Ejemplos

```bash
curl -H 'Authorization: Bearer <token>' \
  'http://localhost:3200/reports/sales-day?init_date=20260930'

curl -H 'Authorization: Bearer <token>' \
  'http://localhost:3200/reports/inventory?warehouse_id=0&limit=20&page=1&search=cafe'
```
