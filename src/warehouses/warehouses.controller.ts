import { Controller, Get, Res, HttpException, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { getHttpStatusWarehouses } from './helpers/warehouses.http-status';
import { HttpResponse } from '../local-responses/classes/http-response';
import { findAllWarehousesUseCaseCompositor } from './compositors/use-case.compositor';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {

  @Get()
  @ApiOperation({ summary: 'Listar todos los almacenes activos' })
  public async findAll(@Res() response: Response, @Req() req: Request): Promise<Response | HttpException> {
    const { data, status } = await findAllWarehousesUseCaseCompositor(req).main();
    const httpStatus = getHttpStatusWarehouses('findAllWarehouses', status || 0);
    return response.status(httpStatus).send(new HttpResponse(data, httpStatus));
  }
}
