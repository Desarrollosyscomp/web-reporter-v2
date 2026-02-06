import { TPaginatedServiceResponse, TServiceResponse } from "../local-responses/response-types/service-response.type";
import { DatabaseConnection } from "../database/database.interface";

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
            IFNULL(SUM(o.propina), 0) AS valpropina,
            IFNULL(SUM(dv.valordev), 0) AS valordev,
            IFNULL(SUM(df.cantidad), 0) AS prodvendid,
            IFNULL(SUM(p.ultcosto * df.cantidad), 0) AS costoacum,
            SUM(f.valortotal) + IFNULL(SUM(o.propina), 0) AS totalconprop,
            alm.nomalmacen
        FROM facturas f
        INNER JOIN almacenes alm
            ON f.idalmacen = alm.idalmacen
            AND alm.idempresa = 1
        LEFT JOIN ordenes o
            ON f.idfactura = o.idfactura
        LEFT JOIN devventas dv
            ON f.idfactura = dv.idfactura
        LEFT JOIN detfacturas df
            ON f.idfactura = df.idfactura
        LEFT JOIN productos p
            ON df.idproducto = p.idproducto
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
            return { data: { sales: rows }, error: false };

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
            LEFT JOIN almacenes ON (facturas.idalmacen = almacenes.idalmacen)
            WHERE fecha = ? AND almacenes.idalmacen = ? AND estado = 0
            LIMIT ? OFFSET ?
            `;

            const queryCount = `
            SELECT COUNT(*) as total 
            FROM facturas 
            WHERE fecha = ? AND idalmacen = ? AND estado = 0
            `;

            const [rows] = await connection.query(query, [date, warehouse_id, limit, offset]);
            const [count] = await connection.execute(queryCount, [date, warehouse_id]);

            return {
                data: [rows, count[0].total],
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
            `
            const [rows] = await connection.query(query, [warehouse_id, invoice_number]);
            return { data: { invoice: rows }, error: false };
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
            const query = `SELECT 
                e.fecha,
                e.idalmacen,
                IFNULL(p.prodvendid, 0) AS prodvendid,
                e.subtot,
                e.ivaimp,
                IFNULL(p.costoacum, 0) AS costoacum,
                e.sumdesc,
                e.total,
                e.retencion,
                e.cantfact,
                IFNULL(d.valordev, 0) AS valordev,
                e.valpropina,
                e.total + IFNULL(e.valpropina, 0) AS totalconprop,
                almd.nomalmacen,
                e.otrosimpuestos,
                e.impuestoinc
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
                    SUM(o.propina) AS valpropina,
                    SUM(a.otrosimpuestos) AS otrosimpuestos,
                    SUM(a.impuestoinc) AS impuestoinc
                FROM facturas a
                LEFT JOIN ordenes o ON o.idfactura = a.idfactura
                WHERE a.fecha BETWEEN ? AND ?
                AND a.estado = 0
                AND (? = 0 OR a.idalmacen IN (?))
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
                AND (? = 0 OR a.idalmacen IN (?))
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
                AND (? = 0 OR a.idalmacen IN (?))
                GROUP BY a.idalmacen, a.fecha
            ) p ON p.fecha = e.fecha AND p.idalmacen = e.idalmacen
            LEFT JOIN almacenes almd ON almd.idalmacen = e.idalmacen
            ORDER BY e.fecha DESC, e.idalmacen
            LIMIT ? OFFSET ?;          
            `;
            const params = [
                init_date, end_date, warehouse_id, warehouse_id,
                init_date, end_date, warehouse_id, warehouse_id,
                init_date, end_date, warehouse_id, warehouse_id,
                limit, offset
            ];
            const [rows] = await connection.query(query, params);

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
            const [count] = await connection.execute(countQuery, [
                init_date,
                end_date,
                warehouse_id,
                warehouse_id
            ]);
            return {
                data: [rows, count[0].total],
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
                    c.fechadoc,
                    c.idtercero,
                    t.nombres,
                    t.apellidos,
                    c.idalmacen,
                    a.nomalmacen,
                    c.valtotaldoc,
                    IFNULL(SUM(dc.valor), 0) AS total_pagado,
                    (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) AS saldo_pendiente
                FROM cartera c
                INNER JOIN terceros t ON t.idtercero = c.idtercero
                INNER JOIN almacenes a ON a.idalmacen = c.idalmacen
                LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                WHERE
                    c.idalmacen = ?
                    AND c.fechadoc BETWEEN ? AND ?
                    AND c.tipodoc IN ('FACTURA', 'PEDIDO')
                    AND c.tipocartera = 1
                GROUP BY c.idcartera
                HAVING saldo_pendiente > 0
                ORDER BY c.fechadoc ASC
                LIMIT ? OFFSET ?;
            `;
            const params = [warehouse_id, init_date, end_date, limit, offset];
            const [rows] = await connection.query(query, params);
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
            const [count] = await connection.query(countQuery, countParams);
            return {
                data: [rows, count[0].total],
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
                        c.fechadoc,
                        c.idtercero,
                        t.nombres,
                        t.apellidos,
                        c.idalmacen,
                        a.nomalmacen,
                        c.valtotaldoc,
                        IFNULL(SUM(dc.valor), 0) AS total_pagado,
                        (c.valtotaldoc - IFNULL(SUM(dc.valor), 0)) AS saldo_pendiente
                    FROM cartera c
                    INNER JOIN terceros t ON t.idtercero = c.idtercero
                    INNER JOIN almacenes a ON a.idalmacen = c.idalmacen
                    LEFT JOIN detcartera dc ON dc.idcartera = c.idcartera
                    WHERE
                        c.idalmacen = ?
                        AND c.fechadoc BETWEEN ? AND ?
                        AND c.tipodoc IN ('COMPRA')
                        AND c.tipocartera = 2
                    GROUP BY c.idcartera
                    HAVING saldo_pendiente > 0
                    ORDER BY c.fechadoc ASC
                    LIMIT ? OFFSET ?;
                 `;
            const params = [warehouse_id, init_date, end_date, limit, offset];
            const [rows] = await connection.query(query, params);
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
            const [count] = await connection.query(countQuery, countParams);
            return {
                data: [rows, count[0].total],
                error: false,
            };

        } catch (error) {
            return { error: true, data: error.message };
        } finally {

            if (connection) this.db.release(connection);
        }
    }


}






