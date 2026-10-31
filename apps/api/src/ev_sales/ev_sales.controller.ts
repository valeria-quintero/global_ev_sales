import { Controller, Get, Query } from '@nestjs/common';
import { EvSalesService } from './ev_sales.service.js';
import { SalesQueryDto } from './dto/sales-query.dto.js';
import { TrendsQueryDto } from './dto/trends-query.dto.js';

@Controller('ev')
export class EvSalesController {
    constructor(private readonly evSalesService: EvSalesService) {}

    @Get('filters')
    getFilters() {
        return this.evSalesService.findFilters();
    }

    @Get('sales')
    getSales(@Query() query: SalesQueryDto) {
        return this.evSalesService.findSales(query);
    }

    @Get('trends')
    getTrends(@Query() query: TrendsQueryDto) {
        return this.evSalesService.findTrends(query);
    }
}
