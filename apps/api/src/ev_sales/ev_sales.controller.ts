import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { EvSalesService } from './ev_sales.service.js';

@Controller('ev')
export class EvSalesController {
    constructor(private readonly evSalesService: EvSalesService) {}

    @Get('filters')
    getFilters() {
        return this.evSalesService.findFilters();
    }

    @Get('sales')
    getSales(
        @Query('region') region?: string,
        @Query('powertrain') powertrain?: string,
        @Query('mode') mode?: string,
        @Query('startYear', new ParseIntPipe({ optional: true })) startYear?: number,
        @Query('endYear', new ParseIntPipe({ optional: true })) endYear?: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
        @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize = 50,
    ) {
        return this.evSalesService.findSales({ region, powertrain, mode, startYear, endYear, page, pageSize });
    }
}
