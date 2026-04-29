-- Script para verificar la consistencia entre los dos métodos de consulta de ventas
-- Fecha: 20260429
-- Almacén: 1

-- Consulta 1: salesDay (modificada con subconsultas)
SELECT
    f.fecha,
    f.idalmacen,
    SUM(f.valortotal) AS total,
    COUNT(DISTINCT f.idfactura) AS cantfact,
    SUM(f.valretenciones) AS retencion,
    SUM(f.valimpuesto) AS ivaimp,
    SUM(f.subtotal) AS subtot,
    SUM(f.valdescuentos) AS sumdesc,
    SUM(f.otrosimpuestos) AS otrosimpuestos,
    SUM(f.impuestoinc) AS impuestoinc,
    IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS valpropina,
    IFNULL((SELECT SUM(dv.valordev) FROM devventas dv WHERE dv.idfactura = f.idfactura), 0) AS valordev,
    IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura = f.idfactura), 0) AS prodvendid,
    IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura = f.idfactura), 0) AS costoacum,
    SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop,
    alm.nomalmacen
FROM facturas f
INNER JOIN almacenes alm
    ON f.idalmacen = alm.idalmacen
    AND alm.idempresa = 1
WHERE
    f.fecha = '20260429'
    AND f.estado = 0
    AND f.idalmacen = 1
GROUP BY
    f.fecha,
    f.idalmacen,
    alm.nomalmacen;

-- Consulta 2: detailSalesDayByWarehouse summary (modificada con subconsultas)
SELECT 
    COALESCE(SUM(f.subtotal),0) as subtotal,
    COALESCE(SUM(f.valimpuesto),0) as total_impuestos,
    COALESCE(SUM(f.valortotal),0) as total_ventas,
    COALESCE(SUM(f.valretenciones),0) as retencion,
    COALESCE(SUM(f.valdescuentos),0) as sumdesc,
    COALESCE(SUM(f.otrosimpuestos),0) as otrosimpuestos,
    COALESCE(SUM(f.impuestoinc),0) as impuestoinc,
    IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS valpropina,
    SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop
FROM facturas f
WHERE f.fecha = '20260429' AND f.idalmacen = 1 AND f.estado = 0;

-- Verificación adicional: consulta simple para comparar valores base
SELECT 
    COUNT(*) as total_facturas,
    SUM(subtotal) as subtotal_base,
    SUM(valimpuesto) as impuesto_base,
    SUM(valortotal) as total_base,
    SUM(valretenciones) as retencion_base,
    SUM(valdescuentos) as descuentos_base
FROM facturas 
WHERE fecha = '20260429' AND idalmacen = 1 AND estado = 0;
