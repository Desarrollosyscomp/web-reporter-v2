import { Controller, Get, Param, Delete, Res, HttpException, Query } from '@nestjs/common';
import type { Response } from 'express';
import { HttpResponse } from '../local-responses/classes/http-response';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { salesDayUseCaseCompositor } from './compositors/use-case.compositors';
import { getHttpStatusReports } from './helpers/reports.http-status';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {

    @Get('sales-day')
    @ApiOperation({ summary: 'Trae el total de ventas por almacenes segun la fecha establecida' })
    @ApiQuery({
        name: 'init_date',
        required: true,
        type: String,
        description: 'Fecha inicial en formato YYYYMMDD',
        example: '20260108',
    })
    public async salesDay(@Res() response: Response, @Query('init_date') init_date: string): Promise<Response | HttpException> {

        const { data, status } = await salesDayUseCaseCompositor().main(init_date);
        let httpStatus = getHttpStatusReports('salesDay', status || 0);
        return response.status(httpStatus).send(new HttpResponse(data, httpStatus));

    }

}
