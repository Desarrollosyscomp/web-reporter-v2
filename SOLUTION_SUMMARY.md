# Solución a Discrepancia en Valores de Ventas

## Problema Identificado
Los valores de ventas no coincidían entre dos endpoints:
- `/reports/sales-day?init_date=20260429` - Ventas por día para todos los almacenes
- `/reports/sales-day/20260429/1?limit=1&page=10` - Detalles por almacén específico

## Causa Raíz
El problema tenía dos causas:

1. **Duplicación por LEFT JOINs**: El uso de LEFT JOINs en las consultas SQL creaba duplicación de registros cuando:
   - Una factura tenía múltiples detalles (detfacturas)
   - Una factura tenía múltiples devoluciones (devventas)  
   - Una factura tenía múltiples propinas (ordenes)

2. **Filtro faltante de empresa**: La consulta `salesDay` incluía el filtro `alm.idempresa = 1` pero `detailSalesDayByWarehouse` no lo tenía, causando que se incluyeran facturas de otras empresas.

## Métodos Afectados y Corregidos

### 1. `salesDay()` - Líneas 12-51
**Cambio:** Reemplazar LEFT JOINs con subconsultas correlacionadas
- `LEFT JOIN ordenes o` → `IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0)`
- `LEFT JOIN devventas dv` → `IFNULL((SELECT SUM(dv.valordev) FROM devventas dv WHERE dv.idfactura = f.idfactura), 0)`
- `LEFT JOIN detfacturas df` → `IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura = f.idfactura), 0)`

### 2. `detailSalesDayByWarehouse()` - Líneas 65-107
**Cambios:** 
- **Filtro de empresa**: Agregar `alm.idempresa = 1` a todas las consultas (query, summaryQuery, paymentMethodsQuery, countQuery)
- **Lógica consistente**: Actualizar summaryQuery para usar la misma lógica que salesDay
- **Campos adicionales**: Agregar retencion, sumdesc, otrosimpuestos, impuestoinc, valpropina, totalconprop
- **Subconsultas correlacionadas**: Usar subconsultas para evitar duplicación

### 3. `dashboard()` - Líneas 795-826
**Cambio:** Actualizar salesDayQuery con las mismas subconsultas correlacionadas

## Validación
Se creó script `test_sales_consistency.sql` para verificar que ambos métodos retornen valores idénticos.

## Resultado Esperado
Ahora ambos endpoints deben retornar valores consistentes para:
- total_ventas / total
- subtotal / subtot  
- total_impuestos / ivaimp
- retencion
- totalconprop

## Notas Importantes
- Se mantuvo COUNT(DISTINCT f.idfactura) para evitar duplicación en conteo de facturas
- Se usó IFNULL() para manejar valores nulos
- Las subconsultas son más eficientes y evitan problemas de cardinalidad
