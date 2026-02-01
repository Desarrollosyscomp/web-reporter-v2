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

}


