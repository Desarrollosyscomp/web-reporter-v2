import { TServiceResponse } from "../local-responses/response-types/service-response.type";
import { DatabaseConnection } from "../database/database.interface";

export class ReportsService {
    public constructor(private readonly db: DatabaseConnection) { }

    public async salesDay(init_date: string): Promise<TServiceResponse> {
        const connection = await this.db.getConnection();

        try {
            const query = `SELECT a.fecha, a.idalmacen, a.prodvendid, e.subtot, e.ivaimp, a.costoacum, e.sumdesc, e.total, e.retencion, e.cantfact, f.valordev, e.valpropina, e.total + IF(ISNULL(e.valpropina), 0, e.valpropina) AS totalconprop, almd.nomalmacen, e.otrosimpuestos, e.impuestoinc
            FROM (SELECT a.idalmacen, a.fecha, SUM(a.valortotal) AS total, COUNT(a.idfactura) AS cantfact, SUM(a.valretenciones) AS retencion, SUM(a.valimpuesto) AS ivaimp, SUM(a.subtotal) AS subtot, SUM(a.valdescuentos) AS sumdesc, SUM(b.propina) AS valpropina, SUM(a.otrosimpuestos) otrosimpuestos, SUM(a.impuestoinc) impuestoinc 
            FROM facturas a
            LEFT JOIN ordenes b ON (a.idfactura = b.idfactura) 
            LEFT JOIN almacenes alm ON (a.idalmacen = alm.idalmacen)
            WHERE a.fecha = ? AND a.estado = 0 AND alm.idempresa = 1  
            GROUP BY  a.idalmacen, a.fecha
            ORDER BY  a.idalmacen, a.fecha ASC) AS e
            LEFT JOIN (SELECT a.idalmacen, a.fecha, SUM(b.valordev) AS valordev
            FROM facturas a
            LEFT JOIN devventas b ON (a.idfactura = b.idfactura) 
            LEFT JOIN almacenes alm ON (a.idalmacen = alm.idalmacen)
            WHERE a.fecha = ? AND a.estado = 0 AND alm.idempresa = 1  
            GROUP BY a.idalmacen, a.fecha
            ORDER BY a.idalmacen, a.fecha ASC) f ON (e.fecha = f.fecha AND e.idalmacen = f.idalmacen)
            LEFT JOIN (SELECT a.fecha, a.idalmacen, SUM(b.cantidad) AS prodvendid, SUM(c.ultcosto * b.cantidad) AS costoacum
            FROM facturas a 
            LEFT JOIN detfacturas b ON (a.idfactura = b.idfactura) 
            LEFT JOIN productos c ON (b.idproducto = c.idproducto)
            LEFT JOIN iva d ON (c.codiva = d.codiva)
            LEFT JOIN almacenes alm ON (a.idalmacen = alm.idalmacen)
            WHERE a.fecha = ? AND a.estado = 0 AND alm.idempresa = 1 
            GROUP BY a.idalmacen, a.fecha
            ORDER BY a.idalmacen, a.fecha ASC) a ON (e.fecha = a.fecha AND a.idalmacen = e.idalmacen) 
            LEFT JOIN almacenes almd ON (a.idalmacen = almd.idalmacen)
            `;
            const [rows] = await connection.query(query, [init_date, init_date, init_date]);
            return { data: { sales: rows }, error: false };

        } catch (error) {
            return { error: true, data: error };

        } finally {
            this.db.release(connection);
        }

    }

}
