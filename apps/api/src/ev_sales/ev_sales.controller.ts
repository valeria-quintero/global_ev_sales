import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { EvSalesService } from './ev_sales.service.js';

//acepta ?regions=China,USA o ?regions=China&regions=USA
const toList = (value: string | string[] | undefined, fallback: string[]) => {
    const list = [value ?? []].flat().flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
    return list.length ? list : fallback;
};

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
        @Query('category') category?: string,
        @Query('startYear', new ParseIntPipe({ optional: true })) startYear?: number,
        @Query('endYear', new ParseIntPipe({ optional: true })) endYear?: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
        @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize = 50,
    ) {
        return this.evSalesService.findSales({ region, powertrain, mode, category, startYear, endYear, page, pageSize });
    }

    @Get('trends')
    getTrends(
        @Query('regions') regions?: string | string[],
        @Query('powertrains') powertrains?: string | string[],
        @Query('mode', new DefaultValuePipe('Cars')) mode = 'Cars',
        @Query('startYear', new ParseIntPipe({ optional: true })) startYear?: number,
        @Query('endYear', new ParseIntPipe({ optional: true })) endYear?: number,
        @Query('groupBy', new DefaultValuePipe('powertrain')) groupBy = 'powertrain',
    ) {
        return this.evSalesService.findTrends({
            regions: toList(regions, ['World']),
            powertrains: toList(powertrains, ['BEV', 'PHEV']),
            mode,
            startYear,
            endYear,
            groupBy,
        });
    }
}
