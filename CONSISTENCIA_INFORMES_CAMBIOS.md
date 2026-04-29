# Cambios para Consistencia entre Informes de Ventas

## Problema Identificado
Había discrepancias entre los informes de ventas por día y el acumulado en los cálculos de:
- Costos (costoacum)
- Cantidad de productos vendidos (prodvendid)

## Causa Raíz
El método `salesDay` no estaba restando las devoluciones como sí lo hacía `getCumulativeSales`, causando valores inconsistentes.

## Métodos Afectados y Corregidos

### 1. Método `salesDay()` - Líneas 12-51

#### Cambios realizados:
**Antes:**
```sql
IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura = f.idfactura), 0) AS prodvendid,
IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura = f.idfactura), 0) AS costoacum,
```

**Después:**
```sql
IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura = f.idfactura), 0) - IFNULL((SELECT SUM(dd.cantidad) FROM devventas dv INNER JOIN detdevventas dd ON dv.iddevventas = dd.iddevventas WHERE dv.idfactura = f.idfactura), 0) AS prodvendid,
IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura = f.idfactura), 0) - IFNULL((SELECT SUM(dd.costo * dd.cantidad) FROM devventas dv INNER JOIN detdevventas dd ON dv.iddevventas = dd.iddevventas WHERE dv.idfactura = f.idfactura), 0) AS costoacum,
```

### 2. Método `dashboard()` - Líneas 858-889

#### Cambios realizados:
Se aplicaron los mismos cambios en el `salesDayQuery` para mantener consistencia.

## Lógica Unificada

Ahora todos los informes usan la misma lógica:

### Para Cantidad de Productos:
```sql
productos_vendidos_netos = 
    SUM(cantidad_vendida) - SUM(cantidad_devuelta)
```

### Para Costos:
```sql
costos_netos = 
    SUM(costo_ventas) - SUM(costo_devoluciones)
```

Donde:
- `cantidad_vendida`: SUM(df.cantidad) de detfacturas
- `cantidad_devuelta`: SUM(dd.cantidad) de detdevventas
- `costo_ventas`: SUM(p.ultcosto * df.cantidad) de detfacturas
- `costo_devoluciones`: SUM(dd.costo * dd.cantidad) de detdevventas

## Correcciones Adicionales para Consistencia Total

### 3. Problema de LEFT JOIN en getCumulativeSales

**Problema identificado:**
- `getCumulativeSales` usaba `LEFT JOIN ordenes` que podía causar duplicación de registros
- `salesDay` usa subconsultas correlacionadas que son más precisas

**Solución:**
- Cambié `SUM(o.propina) AS valpropina` a `IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = a.idfactura), 0) AS valpropina`
- Eliminé el `LEFT JOIN ordenes o ON o.idfactura = a.idfactura`

### 4. Corrección en campo costoacum

**Problema:**
- `getCumulativeSales` mostraba `costoacum` como costo bruto
- `salesDay` mostraba `costoacum` como costo neto (restando devoluciones)

**Solución:**
- Actualicé `costoacum` en `getCumulativeSales` para que reste las devoluciones:
  ```sql
  IFNULL(p.costoacum, 0) - IFNULL(cd.costodevoluciones, 0) AS costoacum
  ```

## Impacto Esperado

1. **Consistencia Total**: 
   - `salesDay(fecha_hoy)` = `getCumulativeSales(fecha_hoy, fecha_hoy)`
   - Todos los campos serán idénticos: total, subtotal, cantfact, ivaimp, costoacum, prodvendid, valordev

2. **Precisión**: Los valores reflejan correctamente el impacto de las devoluciones
3. **Métricas correctas**: 
   - Márgenes de ganancia más precisos
   - Inventario neto correcto
   - Análisis de rentabilidad consistente

## Validación

Para verificar la consistencia, se puede comparar:
- `salesDay` para una fecha específica
- `getCumulativeSales` para el mismo rango de fechas
- `dashboard` que usa ambos métodos

Los valores de `costoacum` y `prodvendid` deberían ser idénticos o consistentemente proporcionales según el rango de fechas.
