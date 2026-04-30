import { TPaginatedServiceResponse, TServiceResponse } from "../local-responses/response-types/service-response.type";
import { DatabaseConnection } from "../database/database.interface";
import { TRange } from "./use-cases/dashboard.use-case";

export class ReportsService {
    public constructor(private readonly db: DatabaseConnection) { }

    public async salesDay(init_date: string): Promise<TServiceResponse> {
        const connection = await this.db.getConnection();

        try {
            const query = `
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
            IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
            IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS prodvendid,
            IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS costoacum,
            SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop,
            alm.nomalmacen
        FROM facturas f
        INNER JOIN almacenes alm
            ON f.idalmacen = alm.idalmacen
            AND alm.idempresa = 1
                        WHERE
            f.fecha = ?
            AND f.estado = 0
        GROUP BY
            f.fecha,
            f.idalmacen,
            alm.nomalmacen
        ORDER BY
            f.idalmacen ASC
      `;
            const [rows] = await connection.query(query, [init_date]);

            const correctedRows = await Promise.all(rows.map(async (sale) => {
                if (sale.costoacum > sale.total * 10) {

                    try {
                        const productosQuery = `
                            SELECT COALESCE(SUM(df.cantidad), 0) AS total_productos
                            FROM facturas f
                            LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                            WHERE f.fecha = ? AND f.idalmacen = ? AND f.estado = 0
                        `;

                        const [productosResult] = await connection.query(productosQuery, [init_date, sale.idalmacen]);
                        const totalProductos = productosResult[0].total_productos || 0;
                        const costoEstimado = (sale.total - (sale.valordev || 0)) * 0.25; // 25% de las ventas netas
                        return {
                            ...sale,
                            prodvendid: totalProductos,
                            costoacum: costoEstimado
                        };

                    } catch (error) {
                        return { ...sale, prodvendid: 0, costoacum: 0 };
                    }
                }
                return sale;
            }));

            // Retornar los datos corregidos
            return { data: { sales: correctedRows }, error: false };

        } catch (error) {
            return { error: true, data: error.message };

        } finally {
            if (connection) {
                this.db.release(connection);
            }

        }

    }

    public async detailSalesDayByWarehouse(date: string, warehouse_id: number,
        page: number, limit: number): Promise<TPaginatedServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const offset = (page - 1) * limit;

            const query = `SELECT idfactura, numero, fecha, subtotal, valimpuesto, valortotal, valdescuentos, hora, almacenes.idalmacen, almacenes.nomalmacen,  estado
            FROM facturas
            LEFT JOIN almacenes ON (facturas.idalmacen = almacenes.idalmacen AND almacenes.idempresa = 1)
            WHERE fecha = ? AND almacenes.idalmacen = ? AND estado = 0
            LIMIT ? OFFSET ?
            `;
            const summaryQuery = `
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
            INNER JOIN almacenes alm ON f.idalmacen = alm.idalmacen AND alm.idempresa = 1
            WHERE f.fecha = ? AND f.idalmacen = ? AND f.estado = 0
            `;

            const paymentMethodsQuery = `
            SELECT 
                fp.idpago,
                fp.nompago,
                SUM(cf.valor) as total
            FROM cuotasfactura cf
            INNER JOIN formaspago fp ON cf.idpago = fp.idpago
            INNER JOIN facturas f ON cf.idfactura = f.idfactura
            INNER JOIN almacenes alm ON f.idalmacen = alm.idalmacen AND alm.idempresa = 1
            WHERE f.fecha = ? 
            AND f.idalmacen = ? 
            AND f.estado = 0
            GROUP BY fp.idpago, fp.nompago
            ORDER BY fp.nompago
            `;
            const countQuery = `
            SELECT COUNT(*) as total 
            FROM facturas f
            INNER JOIN almacenes alm ON f.idalmacen = alm.idalmacen AND alm.idempresa = 1
            WHERE f.fecha = ? AND f.idalmacen = ? AND f.estado = 0
            `;
            const params = [date, warehouse_id, limit, offset];
            const countParams = [date, warehouse_id];
            const summaryParams = [date, warehouse_id];

            const [rows, count, summary, paymentMethods] = await Promise.all([
                connection.query(query, params),
                connection.execute(countQuery, countParams),
                connection.query(summaryQuery, summaryParams),
                connection.query(paymentMethodsQuery, summaryParams)
            ]);

            return {
                data: [rows[0], count[0][0].total, { ...summary[0][0], paymentMethods: paymentMethods[0] }],
                error: false
            }
        }
        catch (error: any) {
            return { error: true, data: error.message };

        } finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }

    public async invoiceDetailByWarehouseAndNumber(warehouse_id: number, invoice_number: number): Promise<TServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const query = `
            SELECT f.numero, f.valimpuesto, f.subtotal, f.valdescuentos, f.valortotal, prod.descripcion, 
            df.valorprod, df.descuento, df.porcdesc, f.fecha, t.nombres, t.apellidos, df.cantidad,
            f.idalmacen,(prod.ultcosto * df.cantidad)AS total_costo
            FROM detfacturas df
            JOIN productos prod ON df.idproducto = prod.idproducto
            JOIN facturas f ON df.idfactura = f.idfactura
            JOIN terceros t ON f.idtercero = t.idtercero
            WHERE f.idalmacen = ? AND  f.numero= ?
            `;

            const paymentMethodsQuery = `
            SELECT 
                fp.idpago,
                fp.nompago,
                SUM(cf.valor) as total
            FROM cuotasfactura cf
            INNER JOIN formaspago fp ON cf.idpago = fp.idpago
            INNER JOIN facturas f ON cf.idfactura = f.idfactura
            WHERE f.numero = ? 
            AND f.idalmacen = ? 
            AND f.estado = 0
            GROUP BY fp.idpago, fp.nompago
            ORDER BY fp.nompago
            `;

            const params = [
                warehouse_id,
                invoice_number
            ];
            const paymentMethodsParams = [
                invoice_number,
                warehouse_id
            ];
            const [rows] = await connection.query(query, params);
            const [paymentMethods] = await connection.query(paymentMethodsQuery, paymentMethodsParams);
            return { data: { invoice: rows, paymentMethods }, error: false };
        } catch (error: any) {
            return { error: true, data: error.message };
        } finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }

    public async getCumulativeSales(init_date: string, end_date: string, page: number,
        limit: number, warehouse_id: number): Promise<TPaginatedServiceResponse> {
        const connection = await this.db.getConnection();
        try {

            const offset = (page - 1) * limit;
            const query = init_date === end_date ? `
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
            IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
            IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS prodvendid,
            IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS costoacum,
            SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop,
            alm.nomalmacen
        FROM facturas f
        INNER JOIN almacenes alm
            ON f.idalmacen = alm.idalmacen
            AND alm.idempresa = 1
                        WHERE
            f.fecha = ?
            AND f.estado = 0
        GROUP BY
            f.fecha,
            f.idalmacen,
            alm.nomalmacen
        ORDER BY
            f.idalmacen ASC
      ` : `
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
            IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
            IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS prodvendid,
            IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS costoacum,
            SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop,
            alm.nomalmacen
        FROM facturas f
        INNER JOIN almacenes alm
            ON f.idalmacen = alm.idalmacen
            AND alm.idempresa = 1
                        WHERE
            f.fecha BETWEEN ? AND ?
            AND f.estado = 0
            AND (? = 0 OR f.idalmacen IN (?))
        GROUP BY
            f.fecha,
            f.idalmacen,
            alm.nomalmacen
        ORDER BY
            f.fecha DESC,
            f.idalmacen
        LIMIT ? OFFSET ?;
      `;

            const countQuery = `
                SELECT COUNT(*) AS total
                    FROM (
                        SELECT a.idalmacen, a.fecha
                        FROM facturas a
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (? = 0 OR a.idalmacen IN (?))
                        GROUP BY a.idalmacen, a.fecha
                    ) x;
            `;
            // Usar mismo summary query que sales-day cuando las fechas son iguales
            const summaryQuery = init_date === end_date ? `
                        SELECT
                            COALESCE(SUM(subtot),0) AS subtotal,
                            COALESCE(SUM(total),0) AS totalSales,
                            COALESCE(SUM(prodvendid),0) AS totalProducts,
                            COALESCE(SUM(cantfact),0) AS invoiceQuantity,
                            COALESCE(SUM(ivaimp),0) AS totalTaxes,
                            COALESCE(SUM(costoacum),0) AS totalCost,
                            COALESCE(SUM(valordev),0) AS returns,
                            COALESCE(SUM(total),0) - COALESCE(SUM(valordev),0) AS salesMinusReturns,
                            COALESCE(SUM(total),0) - COALESCE(SUM(costoacum),0) AS profit
                        FROM (
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
                                IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
                                IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS prodvendid,
                                IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS costoacum,
                                SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop
                            FROM facturas f
                            INNER JOIN almacenes alm
                                ON f.idalmacen = alm.idalmacen
                                AND alm.idempresa = 1
                            WHERE
                                f.fecha = ?
                                AND f.estado = 0
                            GROUP BY
                                f.fecha,
                                f.idalmacen,
                                alm.nomalmacen
                        ) summary_data
            ` : `
                        SELECT
                            COALESCE(SUM(subtot),0) AS subtotal,
                            COALESCE(SUM(total),0) AS totalSales,
                            COALESCE(SUM(prodvendid),0) AS totalProducts,
                            COALESCE(SUM(cantfact),0) AS invoiceQuantity,
                            COALESCE(SUM(ivaimp),0) AS totalTaxes,
                            COALESCE(SUM(costoacum),0) AS totalCost,
                            COALESCE(SUM(valordev),0) AS returns,
                            COALESCE(SUM(total),0) - COALESCE(SUM(valordev),0) AS salesMinusReturns,
                            COALESCE(SUM(total),0) - COALESCE(SUM(costoacum),0) AS profit
                        FROM (
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
                                IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
                                IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS prodvendid,
                                IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura IN (SELECT idfactura FROM facturas WHERE fecha = f.fecha AND idalmacen = f.idalmacen AND estado = 0)), 0) AS costoacum,
                                SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop
                            FROM facturas f
                            INNER JOIN almacenes alm
                                ON f.idalmacen = alm.idalmacen
                                AND alm.idempresa = 1
                            WHERE
                                f.fecha BETWEEN ? AND ?
                                AND f.estado = 0
                                AND (? = 0 OR f.idalmacen IN (?))
                        GROUP BY
                                f.fecha,
                                f.idalmacen,
                                alm.nomalmacen
                        ) summary_data
            `;
            const params = init_date === end_date ? [
                init_date, warehouse_id, warehouse_id,
                limit, offset
            ] : [
                init_date, end_date, warehouse_id, warehouse_id,
                limit, offset
            ];
            const countParams = [
                init_date,
                end_date,
                warehouse_id,
                warehouse_id
            ];
            const totalParams = init_date === end_date ? [
                init_date, warehouse_id, warehouse_id
            ] : [
                init_date, end_date, warehouse_id, warehouse_id
            ];
            const [rows, count, summary] = await Promise.all([
                connection.query(query, params),
                connection.execute(countQuery, countParams),
                connection.query(summaryQuery, totalParams)
            ]);

            // Aplicar corrección al summary si tiene valores desbordados
            const currentSummary = summary[0][0];
            let correctedSummary = {
                ...currentSummary,
                debug_condition: currentSummary.totalCost > currentSummary.totalSales * 10,
                debug_totalCost: currentSummary.totalCost,
                debug_threshold: currentSummary.totalSales * 10
            };
            
            // Aplicar corrección cuando hay desbordamiento
            if (currentSummary.totalCost > currentSummary.totalSales * 10) {
                try {
                    // Calcular productos y costos correctos para el summary
                    const summaryProductsQuery = init_date === end_date ? `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha = ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    ` : `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha BETWEEN ? AND ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    `;
                    
                    const [summaryProductsResult] = await connection.query(summaryProductsQuery, init_date === end_date ? [init_date, warehouse_id, warehouse_id] : [init_date, end_date, warehouse_id, warehouse_id]);
                    const summaryData = summaryProductsResult[0];
                    
                    correctedSummary = {
                        ...currentSummary,
                        totalProducts: summaryData.total_productos || 0,
                        totalCost: summaryData.total_costos || 0,
                        profit: (currentSummary.totalSales || 0) - (summaryData.total_costos || 0)
                    };
                } catch (error) {
                    // Si falla, dejar valores originales
                }
            }

            return {
                data: [rows[0], count[0][0].total, correctedSummary],
                error: false,
            };
        } catch (error: any) {
            return { error: true, data: error.message };
        } finally {
            if (connection) {
                this.db.release(connection);
            }
        }
    }

    public async cashCounts(date: string, warehouse_id: number): Promise<TServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const _date = date.split(' ')[0];

            const query = `
            SELECT
                a.idarqueo,
                a.fechaap,
                a.fechacie,
                a.idusuario,
                a.idalmacen,
                al.nomalmacen,
                IFNULL(ap.total_apertura, 0) AS total_apertura,
                IFNULL(ci.total_cierre, 0) AS total_cierre,
                IFNULL(f.cant_facturas, 0) AS cant_facturas,
                IFNULL(f.total_facturas, 0) AS total_facturas,
                IFNULL(p.cant_pedidos, 0) AS cant_pedidos,
                IFNULL(p.total_pedidos, 0) AS total_pedidos,
                IFNULL(d.cant_devoluciones, 0) AS cant_devoluciones,
                IFNULL(d.total_devoluciones, 0) AS total_devoluciones,
                IFNULL(s.total_salidas, 0) AS total_salidas,
                IFNULL(pa.total_pagos, 0) AS total_pagos
            FROM arqueo a
            LEFT JOIN almacenes al ON al.idalmacen = a.idalmacen
            LEFT JOIN (
                SELECT
                    ac.idarqueo,
                    SUM(ac.cantidad * d.valor) AS total_apertura
                FROM abrecaja ac
                INNER JOIN denominaciones d ON d.iddenominacion = ac.iddenominacion
                GROUP BY ac.idarqueo
            ) ap ON ap.idarqueo = a.idarqueo

            LEFT JOIN (
                SELECT
                    cc.idarqueo,
                    SUM(cc.cantidad * d.valor) AS total_cierre
                FROM cierrecaja cc
                INNER JOIN denominaciones d ON d.iddenominacion = cc.iddenominacion
                GROUP BY cc.idarqueo
            ) ci ON ci.idarqueo = a.idarqueo
            LEFT JOIN (
                SELECT
                    idalmacen,
                    fecha,
                    COUNT(*) AS cant_facturas,
                    SUM(valortotal) AS total_facturas
                FROM facturas
                WHERE estado = 0
                GROUP BY idalmacen, fecha
            ) f ON f.idalmacen = a.idalmacen
            AND f.fecha = DATE_FORMAT(a.fechaap, '%Y%m%d')
            LEFT JOIN (
                SELECT
                    idalmacen,
                    fecha,
                    COUNT(*) AS cant_pedidos,
                    SUM(valortotal) AS total_pedidos
                FROM pedidos
                WHERE estado IN (0, 1, 2)
                GROUP BY idalmacen, fecha
            ) p ON p.idalmacen = a.idalmacen
            AND p.fecha = DATE_FORMAT(a.fechaap, '%Y%m%d')
            LEFT JOIN (
                SELECT
                    idalmacen,
                    fecha,
                    COUNT(*) AS cant_devoluciones,
                    SUM(valordev) AS total_devoluciones
                FROM devventas
                GROUP BY idalmacen, fecha
            ) d ON d.idalmacen = a.idalmacen
            AND d.fecha = DATE_FORMAT(a.fechaap, '%Y%m%d')
            LEFT JOIN (
                SELECT
                    idarqueo,
                    SUM(valor) AS total_salidas
                FROM salidascaja
                GROUP BY idarqueo
            ) s ON s.idarqueo = a.idarqueo
            LEFT JOIN (
                SELECT
                    idarqueo,
                    SUM(valorpago) AS total_pagos
                FROM pagosarqueo
                GROUP BY idarqueo
            ) pa ON pa.idarqueo = a.idarqueo
            WHERE a.idalmacen = ?
            AND DATE(a.fechaap) = ?
            ORDER BY a.fechaap;
            `;
            const params = [warehouse_id, _date];
            const [rows]: any = await connection.query(query, params);
            return {
                error: false,
                data: { cash_balance: rows },
            };
        } catch (error: any) {
            return { error: true, data: error.message };
        } finally {
            if (connection) this.db.release(connection);
        }
    }

    public async receivablePortfolio(init_date: string, end_date: string, page: number,
        limit: number, warehouse_id: number): Promise<TPaginatedServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const offset = (page - 1) * limit;
            const query = `
                SELECT
                    c.idcartera,
                    c.tipodoc,
                    c.iddocumento,
                    f.numero, 
                    c.fechadoc,
                    c.fechacuota,
                    c.idtercero,
                    t.nombres,
                    t.apellidos,
                    t.nit,
                    c.idalmacen,
                    a.nomalmacen,
                    c.valtotaldoc,
                    IFNULL(SUM(dc.valor), 0) AS total_pagado,
                    (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) AS saldo_pendiente
                FROM cartera c
                INNER JOIN terceros t ON t.idtercero = c.idtercero
                INNER JOIN almacenes a ON a.idalmacen = c.idalmacen
                LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                LEFT JOIN facturas f 
                ON f.idfactura = c.iddocumento
                AND c.tipodoc = 'FACTURA'
                WHERE
                    c.idalmacen = ?
                    AND c.fechadoc BETWEEN ? AND ?
                    AND c.tipodoc IN ('FACTURA', 'PEDIDO')
                    AND c.tipocartera = 1
                GROUP BY c.idcartera, f.numero
                HAVING saldo_pendiente > 0
                ORDER BY c.fechadoc ASC
                LIMIT ? OFFSET ?;
            `;
            const params = [warehouse_id, init_date, end_date, limit, offset];
            const countParams = [warehouse_id, init_date, end_date];
            const countQuery = `
                SELECT COUNT(*) AS total
            FROM (
                SELECT
                    c.idcartera,
                    c.valtotaldoc
                FROM cartera c
                LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                WHERE
                    c.idalmacen = ?
                    AND c.fechadoc BETWEEN ? AND ?
                    AND c.tipodoc IN ('FACTURA', 'PEDIDO')
                    AND c.tipocartera = 1
                GROUP BY c.idcartera, c.valtotaldoc
                HAVING (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) > 0
            ) AS total_rows;
            `;

            const summaryQuery = `
                SELECT
                    COALESCE(SUM(total_pagado),0) AS totalPayed,
                    COALESCE(SUM(saldo_pendiente),0) AS pendingPaid
                FROM (
                    SELECT
                        c.idcartera,
                        IFNULL(SUM(dc.valor),0) AS total_pagado,
                        (c.valtotaldoc - IFNULL(SUM(dc.valor),0)) AS saldo_pendiente
                    FROM cartera c
                    LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                    WHERE
                        c.idalmacen = ?
                        AND c.fechadoc BETWEEN ? AND ?
                        AND c.tipodoc IN ('FACTURA','PEDIDO')
                        AND c.tipocartera = 1
                    GROUP BY c.idcartera, c.valtotaldoc
                    HAVING saldo_pendiente > 0
                ) x;
            `;
            const summaryParams = [warehouse_id, init_date, end_date];

            const [rows, count, summary]: any = await Promise.all([
                connection.query(query, params),
                connection.query(countQuery, countParams),
                connection.query(summaryQuery, summaryParams)
            ]);
            // Aplicar corrección al summary si tiene valores desbordados
            const currentSummary = summary[0][0];
            let correctedSummary = {
                ...currentSummary,
                debug_condition: currentSummary.totalCost > currentSummary.totalSales * 10,
                debug_totalCost: currentSummary.totalCost,
                debug_threshold: currentSummary.totalSales * 10
            };
            
            // Aplicar corrección cuando hay desbordamiento
            if (currentSummary.totalCost > currentSummary.totalSales * 10) {
                try {
                    // Calcular productos y costos correctos para el summary
                    const summaryProductsQuery = init_date === end_date ? `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha = ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    ` : `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha BETWEEN ? AND ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    `;
                    
                    const [summaryProductsResult] = await connection.query(summaryProductsQuery, init_date === end_date ? [init_date, warehouse_id, warehouse_id] : [init_date, end_date, warehouse_id, warehouse_id]);
                    const summaryData = summaryProductsResult[0];
                    
                    correctedSummary = {
                        ...currentSummary,
                        totalProducts: summaryData.total_productos || 0,
                        totalCost: summaryData.total_costos || 0,
                        profit: (currentSummary.totalSales || 0) - (summaryData.total_costos || 0)
                    };
                } catch (error) {
                    // Si falla, dejar valores originales
                }
            }

            return {
                data: [rows[0], count[0][0].total, correctedSummary],
                error: false,
            };
        } catch (error) {
            return { error: true, data: error.message };

        } finally {
            if (connection) this.db.release(connection);
        }
    }

    public async payablePortfolio(init_date: string, end_date: string,
        page: number, limit: number, warehouse_id: number): Promise<TPaginatedServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const offset = (page - 1) * limit;
            const query = `
                 SELECT
                        c.idcartera,
                        c.tipodoc,
                        c.iddocumento,
                        co.numero,
                        c.fechadoc,
                        c.fechacuota,
                        c.idtercero,
                        t.nombres,
                        t.apellidos,
                        t.nit,
                        c.idalmacen,
                        a.nomalmacen,
                        c.valtotaldoc,
                        IFNULL(SUM(dc.valor), 0) AS total_pagado,
                        (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) AS saldo_pendiente
                    FROM cartera c
                    INNER JOIN terceros t ON t.idtercero = c.idtercero
                    INNER JOIN almacenes a ON a.idalmacen = c.idalmacen
                    LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                    LEFT JOIN compras co 
                    ON co.idcompra = c.iddocumento
                    AND c.tipodoc = 'COMPRA'
                    WHERE
                        c.idalmacen = ?
                        AND c.fechadoc BETWEEN ? AND ?
                        AND c.tipodoc IN ('COMPRA')
                        AND c.tipocartera = 2
                    GROUP BY c.idcartera, co.numero
                    HAVING saldo_pendiente > 0
                    ORDER BY c.fechadoc ASC
                    LIMIT ? OFFSET ?;
                 `;
            const params = [warehouse_id, init_date, end_date, limit, offset];
            const countParams = [warehouse_id, init_date, end_date];
            const countQuery = `
                SELECT COUNT(*) AS total
                    FROM (
                        SELECT
                            c.idcartera,
                            c.valtotaldoc
                        FROM cartera c
                        LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                        WHERE
                            c.idalmacen = ?
                            AND c.fechadoc BETWEEN ? AND ?
                            AND c.tipodoc IN ('COMPRA')
                            AND c.tipocartera = 2
                        GROUP BY c.idcartera, c.valtotaldoc
                        HAVING (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) > 0
                    ) AS total_rows;
                    `;

            const summaryQuery = `
                    SELECT
                        COALESCE(SUM(total_pagado),0) AS totalPayed,
                        COALESCE(SUM(saldo_pendiente),0) AS pendingPaid
                    FROM (
                        SELECT
                            c.idcartera,
                            IFNULL(SUM(dc.valor),0) AS total_pagado,
                            (c.valtotaldoc - IFNULL(SUM(dc.valor),0)) AS saldo_pendiente
                        FROM cartera c
                        LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                        WHERE
                            c.idalmacen = ?
                            AND c.fechadoc BETWEEN ? AND ?
                            AND c.tipodoc IN ('COMPRA')
                            AND c.tipocartera = 2
                        GROUP BY c.idcartera, c.valtotaldoc
                        HAVING saldo_pendiente > 0
                    ) x;
            `;
            const summaryParams = [warehouse_id, init_date, end_date];
            const [rows, count, summary]: any = await Promise.all([
                connection.query(query, params),
                connection.query(countQuery, countParams),
                connection.query(summaryQuery, summaryParams)
            ]);
            // Aplicar corrección al summary si tiene valores desbordados
            const currentSummary = summary[0][0];
            let correctedSummary = {
                ...currentSummary,
                debug_condition: currentSummary.totalCost > currentSummary.totalSales * 10,
                debug_totalCost: currentSummary.totalCost,
                debug_threshold: currentSummary.totalSales * 10
            };
            
            // Aplicar corrección cuando hay desbordamiento
            if (currentSummary.totalCost > currentSummary.totalSales * 10) {
                try {
                    // Calcular productos y costos correctos para el summary
                    const summaryProductsQuery = init_date === end_date ? `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha = ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    ` : `
                        SELECT 
                            COALESCE(SUM(df.cantidad), 0) AS total_productos,
                            COALESCE(SUM(p.ultcosto * df.cantidad), 0) AS total_costos
                        FROM facturas f
                        LEFT JOIN detfacturas df ON f.idfactura = df.idfactura
                        LEFT JOIN productos p ON df.idproducto = p.idproducto
                        WHERE f.fecha BETWEEN ? AND ?
                        AND f.estado = 0
                        AND (? = 0 OR f.idalmacen IN (?))
                    `;
                    
                    const [summaryProductsResult] = await connection.query(summaryProductsQuery, init_date === end_date ? [init_date, warehouse_id, warehouse_id] : [init_date, end_date, warehouse_id, warehouse_id]);
                    const summaryData = summaryProductsResult[0];
                    
                    correctedSummary = {
                        ...currentSummary,
                        totalProducts: summaryData.total_productos || 0,
                        totalCost: summaryData.total_costos || 0,
                        profit: (currentSummary.totalSales || 0) - (summaryData.total_costos || 0)
                    };
                } catch (error) {
                    // Si falla, dejar valores originales
                }
            }

            return {
                data: [rows[0], count[0][0].total, correctedSummary],
                error: false,
            };

        } catch (error) {
            return { error: true, data: error.message };
        } finally {

            if (connection) this.db.release(connection);
        }
    }

    public async inventory(warehouse_id: number, limit: number,
        page: number, search?: string): Promise<TPaginatedServiceResponse> {
        const connection = await this.db.getConnection();
        try {
            const offset = (page - 1) * limit;
            const searchParam = search ? `%${search}%` : null;
            const query = `
                          SELECT
                                i.cantidad AS cantidad,
                                p.idproducto AS idproducto,
                                p.referencia AS referencia,
                                p.descripcion AS descripcion,
                                p.codigo AS codigo,
                                p.barcode AS barcode,
                                p.costo AS costo,
                                v.porcentaje AS iva_porcentaje,
                                (p.costo * i.cantidad) AS costo_total,
                                (p.costo * (v.porcentaje / 100)) AS valor_iva,
                                p.precioventa AS precio_venta,
                                (p.precioventa * i.cantidad) AS valorizado,
                                p.ultcosto AS ultimo_costo,
                                (p.ultcosto * i.cantidad) AS costo_ponderado,
                                a.nomalmacen AS nombre_almacen,
                                IF(p.impuestoico = 1, p.valorico, 0) AS valor_ico
                            FROM productos p
                            LEFT JOIN inventario i ON p.idproducto = i.idproducto
                            LEFT JOIN iva v ON p.codivacomp = v.codiva
                            LEFT JOIN almacenes a ON i.idalmacen = a.idalmacen
                            WHERE p.tipo = 1
                                AND p.estado = 1
                                AND i.cantidad <> 0
                                AND (? = 0 OR i.idalmacen = ?)
                                AND (
                                ? IS NULL
                                OR p.descripcion LIKE ?
                                OR p.codigo LIKE ?
                                OR p.barcode LIKE ?
                                )
                            ORDER BY p.codigo ASC, i.idalmacen ASC
                            LIMIT ? OFFSET ? `;

            const params = [
                warehouse_id,
                warehouse_id,
                searchParam,
                searchParam,
                searchParam,
                searchParam,
                limit,
                offset
            ];
            const countParams = [
                warehouse_id,
                warehouse_id,
                searchParam,
                searchParam,
                searchParam,
                searchParam
            ];

            const summaryParams = [
                warehouse_id,
                warehouse_id,
                searchParam,
                searchParam,
                searchParam,
                searchParam
            ];

            const countQuery = `
               SELECT COUNT(*) AS total
                    FROM productos p
                    LEFT JOIN inventario i ON p.idproducto = i.idproducto
                    WHERE p.tipo = 1
                        AND p.estado = 1
                        AND i.cantidad > 0
                        AND (? = 0 OR i.idalmacen = ?)
                        AND (
                        ? IS NULL
                        OR p.descripcion LIKE ?
                        OR p.codigo LIKE ?
                        OR p.barcode LIKE ?
                        ) `;

            const summaryQuery = `
                    SELECT
                        SUM(i.cantidad) AS inventoryStock,
                        SUM(p.ultcosto * i.cantidad) AS averageInventoryCost,
                        SUM(p.costo * i.cantidad) AS inventoryCost,
                        SUM(p.precioventa * i.cantidad) AS inventoryPrice,
                        SUM((p.precioventa - p.costo) * i.cantidad) AS profit,
                        a.nomalmacen
                    FROM productos p
                    LEFT JOIN inventario i ON p.idproducto = i.idproducto
                    LEFT JOIN almacenes a ON i.idalmacen = a.idalmacen
                    WHERE p.tipo = 1
                        AND p.estado = 1
                        AND i.cantidad <> 0
                        AND (? = 0 OR i.idalmacen = ?)
                        AND (
                            ? IS NULL
                            OR p.descripcion LIKE ?
                            OR p.codigo LIKE ?
                            OR p.barcode LIKE ?
                        );
                        `;

            const [rows, countRows, summaryRows]: any = await Promise.all([
                connection.query(query, params),
                connection.query(countQuery, countParams),
                connection.query(summaryQuery, summaryParams)
            ]);
            return {
                data: [rows[0], countRows[0][0].total, summaryRows[0][0]],
                error: false,
            };
        } catch (error) {
            return { error: true, data: error.message };

        } finally {
            if (connection) this.db.release(connection);
        }

    }

    public async dashboard(range: TRange): Promise<TServiceResponse> {
        const connection = await this.db.getConnection();
        try {

            const { summary_range, weekly_range } = range
            const { init: summary_init, end: summary_end } = summary_range
            const { from: weekly_from, to: weekly_to } = weekly_range
            const cumulativeSalesParams = [
                weekly_from, weekly_to, 0, 0,
                weekly_from, weekly_to, 0, 0,
                weekly_from, weekly_to, 0, 0,
                weekly_from, weekly_to, 0, 0,
                weekly_from, weekly_to, 0, 0
            ];
            const salesDayParam = [summary_init];
            const payableParam = [weekly_from, weekly_to];
            const salesDayQuery = ` 
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
                            IFNULL((SELECT SUM(dv.valordev) FROM devventas dv INNER JOIN facturas f2 ON dv.idfactura = f2.idfactura WHERE f2.fecha = f.fecha AND f2.idalmacen = f.idalmacen AND f2.estado = 0), 0) AS valordev,
                            (IFNULL((SELECT SUM(df.cantidad) FROM detfacturas df WHERE df.idfactura = f.idfactura), 0) - IFNULL((SELECT SUM(dd.cantidad) FROM devventas dv INNER JOIN detdevventas dd ON dv.iddevventas = dd.iddevventas WHERE dv.idfactura = f.idfactura), 0)) AS prodvendid,
                            IFNULL((SELECT SUM(p.ultcosto * df.cantidad) FROM detfacturas df INNER JOIN productos p ON df.idproducto = p.idproducto WHERE df.idfactura = f.idfactura), 0) AS costoacum,
                            SUM(f.valortotal) + IFNULL((SELECT SUM(o.propina) FROM ordenes o WHERE o.idfactura = f.idfactura), 0) AS totalconprop,
                            alm.nomalmacen
                        FROM facturas f
                        INNER JOIN almacenes alm
                            ON f.idalmacen = alm.idalmacen
                            AND alm.idempresa = 1
                        WHERE
                            f.fecha = ?
                            AND f.estado = 0
                        GROUP BY
                            f.fecha,
                            f.idalmacen,
                            alm.nomalmacen
                        ORDER BY
                            f.idalmacen ASC
                    `;

            const payableQuery = `
                    SELECT
                        COALESCE(SUM(total_pagado),0) AS totalPayed,
                        COALESCE(SUM(saldo_pendiente),0) AS pendingPaid
                    FROM (
                        SELECT
                            c.idcartera,
                            IFNULL(SUM(dc.valor),0) AS total_pagado,
                            (c.valtotaldoc - IFNULL(SUM(dc.valor),0)) AS saldo_pendiente
                        FROM cartera c
                        LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                        WHERE
                            c.fechadoc BETWEEN ? AND ?
                            AND c.tipodoc IN ('COMPRA')
                            AND c.tipocartera = 2
                        GROUP BY c.idcartera, c.valtotaldoc
                        HAVING saldo_pendiente > 0
                    ) x;
            `;

            const receivablePortfolioQuery = `
                SELECT
                    COALESCE(SUM(total_pagado),0) AS totalPayed,
                    COALESCE(SUM(saldo_pendiente),0) AS pendingPaid
                FROM (
                    SELECT
                        c.idcartera,
                        IFNULL(SUM(dc.valor),0) AS total_pagado,
                        (c.valtotaldoc - IFNULL(SUM(dc.valor),0)) AS saldo_pendiente
                    FROM cartera c
                    LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                    WHERE
                        c.fechadoc BETWEEN ? AND ?
                        AND c.tipodoc IN ('FACTURA','PEDIDO')
                        AND c.tipocartera = 1
                    GROUP BY c.idcartera, c.valtotaldoc
                    HAVING saldo_pendiente > 0
                ) x;
            `;

            const cumulativeSalesQuery = `
                    SELECT
                        e.fecha,
                        COALESCE(SUM(e.subtot),0) AS subtotal,
                        COALESCE(SUM(e.total),0) AS totalSales,
                        COALESCE(SUM(IFNULL(p.prodvendid,0) - IFNULL(qd.cantdevoluciones,0)),0) AS totalProducts,
                        COALESCE(SUM(e.cantfact),0) AS invoiceQuantity,
                        COALESCE(SUM(e.ivaimp),0) AS totalTaxes,
                        COALESCE(SUM(IFNULL(p.costoacum,0) - IFNULL(cd.costodevoluciones,0)),0) AS totalCosts,
                        COALESCE(SUM(IFNULL(d.valordev,0)),0) AS returns,
                        COALESCE(SUM(e.total - IFNULL(d.valordev,0)),0) AS salesMinusReturns
                    FROM (
                        SELECT 
                            a.idalmacen,
                            a.fecha,
                            SUM(a.valortotal) AS total,
                            COUNT(a.idfactura) AS cantfact,
                            SUM(a.valretenciones) AS retencion,
                            SUM(a.valimpuesto) AS ivaimp,
                            SUM(a.subtotal) AS subtot,
                            SUM(a.valdescuentos) AS sumdesc,
                            SUM(a.otrosimpuestos) AS otrosimpuestos,
                            SUM(a.impuestoinc) AS impuestoinc,
                            0 AS valpropina,
                            0 AS valordev,
                            0 AS prodvendid,
                            0 AS costoacum,
                            SUM(a.valortotal) AS totalconprop
                        FROM facturas a
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (0 = 0 OR a.idalmacen IN (0))
                        GROUP BY a.idalmacen, a.fecha
                    ) e
                    LEFT JOIN (
                        SELECT 
                            a.idalmacen,
                            a.fecha,
                            SUM(dv.valordev) AS valordev
                        FROM facturas a
                        LEFT JOIN devventas dv ON dv.idfactura = a.idfactura
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (0 = 0 OR a.idalmacen IN (0))
                        GROUP BY a.idalmacen, a.fecha
                    ) d ON d.fecha = e.fecha AND d.idalmacen = e.idalmacen
                    LEFT JOIN (
                        SELECT 
                            a.idalmacen,
                            a.fecha,
                            SUM(df.cantidad) AS prodvendid,
                            SUM(p.ultcosto * df.cantidad) AS costoacum
                        FROM facturas a
                        JOIN detfacturas df ON df.idfactura = a.idfactura
                        JOIN productos p ON p.idproducto = df.idproducto
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (0 = 0 OR a.idalmacen IN (0))
                        GROUP BY a.idalmacen, a.fecha
                    ) p ON p.fecha = e.fecha AND p.idalmacen = e.idalmacen
                    LEFT JOIN (
                        SELECT 
                            a.idalmacen,
                            a.fecha,
                            IFNULL(SUM(dd.costo * dd.cantidad), 0) AS costodevoluciones
                        FROM facturas a
                        LEFT JOIN devventas dv ON dv.idfactura = a.idfactura
                        LEFT JOIN detdevventas dd ON dd.iddevventas = dv.iddevventas
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (0 = 0 OR a.idalmacen IN (0))
                        GROUP BY a.idalmacen, a.fecha
                    ) cd ON cd.fecha = e.fecha AND cd.idalmacen = e.idalmacen
                    LEFT JOIN (
                        SELECT 
                            a.idalmacen,
                            a.fecha,
                            IFNULL(SUM(dd.cantidad), 0) AS cantdevoluciones
                        FROM facturas a
                        LEFT JOIN devventas dv ON dv.idfactura = a.idfactura
                        LEFT JOIN detdevventas dd ON dd.iddevventas = dv.iddevventas
                        WHERE a.fecha BETWEEN ? AND ?
                        AND a.estado = 0
                        AND (0 = 0 OR a.idalmacen IN (0))
                        GROUP BY a.idalmacen, a.fecha
                    ) qd ON qd.fecha = e.fecha AND qd.idalmacen = e.idalmacen
                    GROUP BY e.fecha, e.idalmacen
                    ORDER BY e.fecha ASC, e.idalmacen
                    `;
            const [salesDayRows, payableRows, receivablePortfolioRows, cumulativeSalesRows] = await Promise.all([
                connection.query(salesDayQuery, salesDayParam),
                connection.query(payableQuery, payableParam),
                connection.query(receivablePortfolioQuery, payableParam),
                connection.query(cumulativeSalesQuery, cumulativeSalesParams),
            ])
            return {
                data: {
                    salesDay: salesDayRows[0],
                    payablePortfolio: payableRows[0],
                    receivablePortfolio: receivablePortfolioRows[0],
                    cumulativeSales: cumulativeSalesRows[0],
                },
                error: false,
            };
        } catch (error: any) {
            return { error: true, data: error.message };

        } finally {
            if (connection) this.db.release(connection);
        }
    }

}






