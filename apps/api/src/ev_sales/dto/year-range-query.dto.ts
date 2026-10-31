import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_YEAR, MIN_YEAR } from '../ev_sales.constants.js';

export class YearRangeQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(MIN_YEAR)
    @Max(MAX_YEAR)
    startYear?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(MIN_YEAR)
    @Max(MAX_YEAR)
    endYear?: number;
}
