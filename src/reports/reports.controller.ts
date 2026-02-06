import { Controller, Get, Param, Delete, Res, HttpException, Query, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { HttpResponse } from '../local-responses/classes/http-response';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
    cashCountsUseCaseCompositor,
    cumulativeSalesUseCaseCompositor,
    detailSalesDayByWarehouseUseCaseCompositor,
    invoiceDetailUseCaseCompositor,
    receivablePortfolioUseCaseCompositor,
    salesDayUseCaseCompositor
} from './compositors/use-case.compositors';
import { getHttpStatusReports } from './helpers/reports.http-status';
import {
    cashCountsValidatorCompositor,
    invoiceDetailValidatorCompositor, salesDayValidatorCompositor
} from './compositors/validator.compositor';
import { getValidationHttpStatus } from './helpers/reports-validator.http-status';
import { PaginateReportDto } from './dto/paginate-report.dto';
import { GetReportDto } from './dto/get-report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {

    @Get('sales-day')
    @ApiOperation({ summary: 'Trae el total de ventas de los almacenes según la fecha establecida' })
    @ApiQuery({
        name: 'init_date',
        required: true,
        type: String,
        description: 'Fecha inicial en formato YYYYMMDD',
        example: '20260108',
    })
    public async salesDay(@Res() response: Response, @Query('init_date') init_date: string): Promise<Response | HttpException> {

        const validate = await salesDayValidatorCompositor().validate(init_date);
        if (!validate.success) {
            const validationData = validate.getData();
            const statusCode = validationData.status ?? 0;
            let httpStatus = getValidationHttpStatus('validateSales', statusCode);

            return response
                .status(httpStatus)
                .send(
                    new HttpException(
                        validationData.message || 'Validation failed',
                        httpStatus,
                    ),
                );
        }
        const { data, status } = await salesDayUseCaseCompositor().main(init_date);
        let httpStatus = getHttpStatusReports('salesDay', status || 0);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    @Get('sales-day/:date/:warehouse_id')
    @ApiOperation({ summary: "Listado de las ventas por almacén según la fecha establecida" })
    @ApiParam({ name: 'date', required: true, example: '20260108' })
    @ApiParam({ name: 'warehouse_id', required: true, example: 1 })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })

    public async detailSalesDayByWarehouse(@Res() response: Response,
        @Param('date') date: string,
        @Param('warehouse_id', ParseIntPipe) warehouse_id: number,
        @Query() paginateReportDto: PaginateReportDto): Promise<Response | HttpException> {
        const { page, limit } = paginateReportDto;
        const { data, status } = await detailSalesDayByWarehouseUseCaseCompositor().main(date, warehouse_id, page, limit);
        let httpStatus = getHttpStatusReports('detailSalesDayByWarehouse', status || 0);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    @Get('invoice-detail/:warehouse_id/:invoice_number')
    @ApiOperation({ summary: "Detalle de la factura según el número y el almacén" })
    @ApiParam({ name: 'warehouse_id', required: true, example: 1, type: Number })
    @ApiParam({ name: 'invoice_number', required: true, example: 500, type: Number })

    public async invoiceDetail(@Res() response: Response,
        @Param('warehouse_id', ParseIntPipe) warehouse_id: number,
        @Param('invoice_number', ParseIntPipe) invoice_number: number): Promise<Response | HttpException> {
        const validate = await invoiceDetailValidatorCompositor().validate(invoice_number, warehouse_id);
        if (!validate.success) {
            const validationData = validate.getData();
            const statusCode = validationData.status ?? 0;
            let httpStatus = getValidationHttpStatus('validateInvoiceDetail', statusCode);
            return response
                .status(httpStatus)
                .send(
                    new HttpException(
                        validationData.message || 'Validation failed',
                        httpStatus,
                    ),
                );
        }

        const { data, status } = await invoiceDetailUseCaseCompositor().main(warehouse_id, invoice_number);
        let httpStatus = getHttpStatusReports('invoiceDetail', status || 0);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    @Get('cumulative-sales')
    @ApiOperation({ summary: "Informe de ventas acumulado por fechas seleccionadas y almacenes" })
    @ApiQuery({
        name: 'init_date',
        required: true,
        type: String,
        description: 'Fecha inicial en formato YYYYMMDD',
        example: '20260201',
    })
    @ApiQuery({
        name: 'end_date',
        required: true,
        type: String,
        description: 'Fecha final en formato YYYYMMDD',
        example: '20260202',
    })
    @ApiQuery({ name: 'page', required: true, example: 1 })
    @ApiQuery({ name: 'limit', required: true, example: 10 })
    @ApiQuery({
        name: 'warehouse_id', required: true, example: 1,
        description: 'Si el informe es de todos los almacenes, mandar por defecto 0 '
    })
    public async cumulativeSales(@Res() response: Response,
        @Query() getReportDto: GetReportDto): Promise<Response | HttpException> {
        const { init_date, end_date, page, limit, warehouse_id } = getReportDto;
        const { data, status } = await cumulativeSalesUseCaseCompositor().main(init_date, end_date,
            page, limit, warehouse_id);
        let httpStatus = getHttpStatusReports('cumulativeSales', status || 1);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    @Get('cash-counts')
    @ApiOperation({ summary: "Informe de arqueos de caja teniendo en cuenta pedidos y facturas" })
    @ApiQuery({
        name: 'date',
        required: true,
        type: String,
        description: 'Fecha inicial en formato  ISO 8601 (YYYY-MM-DD HH:mm:ss)',
        example: '2026-02-04 00:00:00',
    })
    @ApiQuery({
        name: 'warehouse_id', required: true, example: 1,
        description: 'Id del almacén para consultar reporte '
    })
    public async cashCounts(@Res() response: Response, @Query('date') date: string,
        @Query('warehouse_id') warehouse_id: number): Promise<Response | HttpException> {
        const validate = await cashCountsValidatorCompositor().validate(date, warehouse_id);
        if (!validate.success) {
            const validationData = validate.getData();
            const statusCode = validationData.status ?? 0;
            let httpStatus = getValidationHttpStatus('validateCashCounts', statusCode);
            return response
                .status(httpStatus)
                .send(
                    new HttpException(
                        validationData.message || 'Validation failed',
                        httpStatus,
                    ),
                );
        }
        const { data, status } = await cashCountsUseCaseCompositor().main(date, warehouse_id);
        const httpStatus = getHttpStatusReports('cashCounts', status || 1);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    @Get('receivable-portfolio')
    @ApiOperation({ summary: "Informe de cuentas por pagar de facturas y pedidos" })
    @ApiQuery({
        name: 'init_date',
        required: true,
        type: String,
        description: 'Fecha inicial en formato YYYYMMDD',
        example: '20260201',
    })
    @ApiQuery({
        name: 'end_date',
        required: true,
        type: String,
        description: 'Fecha final en formato YYYYMMDD',
        example: '20260205',
    })
    @ApiQuery({ name: 'page', required: true, example: 1 })
    @ApiQuery({ name: 'limit', required: true, example: 10 })
    @ApiQuery({
        name: 'warehouse_id', required: true, example: 1,
        description: 'id del almacén para consultar reporte '
    })
    public async receivablePortfolio(@Res() response: Response, @Query() getReportDto: GetReportDto): Promise<Response | HttpException> {
        const { init_date, end_date, page, limit, warehouse_id } = getReportDto;
        const { data, status } = await receivablePortfolioUseCaseCompositor().main(init_date, end_date, page, limit, warehouse_id);
        const httpStatus = getHttpStatusReports('receivablePortfolio', status || 1);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
    }

    // @Get('payable-portfolio')
    // @ApiOperation({ summary: "Informe de cuentas por cobrar de compras" })
    // @ApiParam({ name: 'date', required: true, example: '20260205' })
    // @ApiQuery({
    //     name: 'warehouse_id', required: true, example: 1,
    //     description: 'Id del almacén para consultar reporte '
    // })

}
