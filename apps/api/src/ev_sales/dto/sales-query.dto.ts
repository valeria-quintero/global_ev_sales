import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CATEGORIES, DEFAULT_CATEGORY, MAX_PAGE_SIZE, MODES, POWERTRAINS } from '../ev_sales.constants.js';
import { YearRangeQueryDto } from './year-range-query.dto.js';

export class SalesQueryDto extends YearRangeQueryDto {
    @IsOptional()
    @IsString()
    region?: string;

    @IsOptional()
    @IsIn(POWERTRAINS)
    powertrain?: string;

    @IsOptional()
    @IsIn(MODES)
    mode?: string;

    @IsOptional()
    @IsIn(CATEGORIES)
    category: string = DEFAULT_CATEGORY;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    pageSize: number = 50;
}
