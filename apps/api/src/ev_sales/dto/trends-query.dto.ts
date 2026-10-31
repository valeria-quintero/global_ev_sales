import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';
import { GROUP_BY, MODES, POWERTRAINS, type GroupBy } from '../ev_sales.constants.js';
import { YearRangeQueryDto } from './year-range-query.dto.js';

//acepta ?regions=China,USA o ?regions=China&regions=USA
const toList = ({ value }: { value: unknown }) =>
    [value].flat().flatMap((v) => String(v).split(',')).map((v) => v.trim()).filter(Boolean);

export class TrendsQueryDto extends YearRangeQueryDto {
    @Transform(toList)
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    regions: string[] = ['World'];

    @Transform(toList)
    @IsArray()
    @ArrayNotEmpty()
    @IsIn(POWERTRAINS, { each: true })
    powertrains: string[] = ['BEV', 'PHEV'];

    @IsIn(MODES)
    mode: string = 'Cars';

    @IsIn(GROUP_BY)
    groupBy: GroupBy = 'powertrain';
}
