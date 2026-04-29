# Cambios para Incluir Costo de Devoluciones en Informe de Ventas Acumulado

## Problema
El informe de ventas acumulado no estaba teniendo en cuenta el costo de las devoluciones en el cálculo de `totalCost`.

## Solución Implementada

### 1. Método `getCumulativeSales()` - Líneas 183-376

#### Cambios en la consulta principal:
- **Nueva subconsulta**: Agregué `cd` (costo de devoluciones) que calcula:
  ```sql
  LEFT JOIN (
      SELECT 
          a.idalmacen,
          a.fecha,
          SUM(dd.costo * dd.cantidad) AS costodevoluciones
      FROM facturas a
      JOIN devventas dv ON dv.idfactura = a.idfactura
      JOIN detdevventas dd ON dd.iddevventas = dv.iddevventas
      WHERE a.fecha BETWEEN ? AND ?
      AND a.estado = 0
      AND (? = 0 OR a.idalmacen IN (?))
      GROUP BY a.idalmacen, a.fecha
  ) cd ON cd.fecha = e.fecha AND cd.idalmacen = e.idalmacen
  ```

- **Nueva subconsulta**: Agregué `qd` (cantidad devueltas) que calcula:
  ```sql
  LEFT JOIN (
      SELECT 
          a.idalmacen,
          a.fecha,
          SUM(dd.cantidad) AS cantdevoluciones
      FROM facturas a
      JOIN devventas dv ON dv.idfactura = a.idfactura
      JOIN detdevventas dd ON dd.iddevventas = dv.iddevventas
      WHERE a.fecha BETWEEN ? AND ?
      AND a.estado = 0
      AND (? = 0 OR a.idalmacen IN (?))
      GROUP BY a.idalmacen, a.fecha
  ) qd ON qd.fecha = e.fecha AND qd.idalmacen = e.idalmacen
  ```

- **Nuevos campos en SELECT**:
  - `IFNULL(cd.costodevoluciones, 0) AS costodevoluciones`
  - `IFNULL(p.costoacum, 0) - IFNULL(cd.costodevoluciones, 0) AS costoneto`
  - `IFNULL(p.prodvendid, 0) - IFNULL(qd.cantdevoluciones, 0) AS prodvendid`

- **Parámetros actualizados**: Se agregaron 8 parámetros adicionales (4 para cada nueva subconsulta)

#### Cambios en summaryQuery:
- **Mismas subconsultas** de costo y cantidad de devoluciones
- **Cálculos actualizados**:
  - `COALESCE(SUM(IFNULL(p.costoacum,0) - IFNULL(cd.costodevoluciones,0)),0) AS totalCosts`
  - `COALESCE(SUM(IFNULL(p.prodvendid,0) - IFNULL(qd.cantdevoluciones,0)),0) AS totalProducts`
- **Parámetros actualizados**: Se agregaron 8 parámetros adicionales

### 2. Método `dashboard()` - Líneas 814-825

#### Cambios en cumulativeSalesQuery:
- **Mismas subconsultas**: Costo y cantidad de devoluciones
- **Cálculos actualizados**:
  - `COALESCE(SUM(IFNULL(p.costoacum,0) - IFNULL(cd.costodevoluciones,0)),0) AS totalCosts`
  - `COALESCE(SUM(IFNULL(p.prodvendid,0) - IFNULL(qd.cantdevoluciones,0)),0) AS totalProducts`
- **Parámetros actualizados**: cumulativeSalesParams ahora tiene 20 parámetros (8 adicionales)

## Lógica de Cálculo

### Antes:
```sql
totalCosts = SUM(costo_productos_vendidos)
totalProducts = SUM(cantidad_productos_vendidos)
```

### Después:
```sql
totalCosts = SUM(costo_productos_vendidos) - SUM(costo_devoluciones)
totalProducts = SUM(cantidad_productos_vendidos) - SUM(cantidad_devoluciones)
```

Donde:
- `costo_productos_vendidos` = SUM(p.ultcosto * df.cantidad) de detfacturas
- `costo_devoluciones` = SUM(dd.costo * dd.cantidad) de detdevventas
- `cantidad_productos_vendidos` = SUM(df.cantidad) de detfacturas
- `cantidad_devoluciones` = SUM(dd.cantidad) de detdevventas

## Tablas Involucradas

1. **facturas**: Tabla principal de facturas
2. **devventas**: Cabecera de devoluciones (relacionada con facturas)
3. **detdevventas**: Detalle de devoluciones (contiene costo y cantidad devuelta)
4. **detfacturas**: Detalle de facturas (contiene costo y cantidad vendida)
5. **productos**: Información de productos (último costo)

## Impacto
- El `totalCost` ahora refleja correctamente el costo neto restando las devoluciones
- Los márgenes de ganancia serán más precisos
- Consistencia entre todos los informes que usan lógica de costos
