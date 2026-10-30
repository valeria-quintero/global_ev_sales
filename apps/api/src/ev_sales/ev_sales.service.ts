import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

const MAX_PAGE_SIZE = 200;
const DEFAULT_CATEGORY = 'Historical';

export interface FindSalesParams {
    region?: string;
    powertrain?: string;
    mode?: string;
    category?: string;
    startYear?: number;
    endYear?: number;
    page: number;
    pageSize: number;
}

export interface FindTrendsParams {
    regions: string[];
    powertrains: string[];
    mode: string;
    startYear?: number;
    endYear?: number;
    groupBy: string;
}

@Injectable()
export class EvSalesService {
    constructor (private readonly prismaService: PrismaService) {}

    async findFilters () {
        //solo datos históricos, para que los selectores no muestren años de proyección
        const where = { category: DEFAULT_CATEGORY };
        const [regions, powertrains, modes, years] = await Promise.all([
            this.prismaService.evSale.findMany({ where, distinct: ['region'], select: { region: true }, orderBy: { region: 'asc' } }),
            this.prismaService.evSale.findMany({ where, distinct: ['powertrain'], select: { powertrain: true }, orderBy: { powertrain: 'asc' } }),
            this.prismaService.evSale.findMany({ where, distinct: ['mode'], select: { mode: true }, orderBy: { mode: 'asc' } }),
            this.prismaService.evSale.findMany({ where, distinct: ['year'], select: { year: true }, orderBy: { year: 'asc' } }),
        ]);

        return {
            regions: regions.map((r) => r.region),
            powertrains: powertrains.map((r) => r.powertrain),
            modes: modes.map((r) => r.mode),
            years: years.map((r) => r.year),
        };
    }

    async findSales ({ region, powertrain, mode, category, startYear, endYear, page, pageSize }: FindSalesParams) {
        const take = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        const currentPage = Math.max(page, 1);

        const where: Prisma.EvSaleWhereInput = {
            category: category || DEFAULT_CATEGORY,
            ...(region && { region }),
            ...(powertrain && { powertrain }),
            ...(mode && { mode }),
            ...((startYear !== undefined || endYear !== undefined) && {
                year: { gte: startYear, lte: endYear },
            }),
        };

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.evSale.findMany({
                where,
                orderBy: [{ year: 'desc' }, { region: 'asc' }, { id: 'asc' }],
                skip: (currentPage - 1) * take,
                take,
            }),
            this.prismaService.evSale.count({ where }),
        ]);

        return {
            data,
            total,
            page: currentPage,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findTrends ({ regions, powertrains, mode, startYear, endYear, groupBy }: FindTrendsParams) {
        if (groupBy !== 'powertrain' && groupBy !== 'region') {
            throw new BadRequestException('groupBy debe ser "powertrain" o "region"');
        }

        //siempre datos históricos de ventas en vehículos
        const rows = await this.prismaService.evSale.groupBy({
            by: ['year', groupBy],
            where: {
                category: DEFAULT_CATEGORY,
                parameter: 'EV sales',
                unit: 'Vehicles',
                mode,
                region: { in: regions },
                powertrain: { in: powertrains },
                ...((startYear !== undefined || endYear !== undefined) && {
                    year: { gte: startYear, lte: endYear },
                }),
            },
            _sum: { value: true },
            orderBy: { year: 'asc' },
        });

        //una fila por año, con una columna por cada serie
        const series = groupBy === 'powertrain' ? powertrains : regions;
        const byYear = new Map<number, Record<string, number>>();

        for (const row of rows) {
            const entry = byYear.get(row.year) ?? Object.fromEntries(series.map((s) => [s, 0]));
            entry[row[groupBy]] = row._sum.value ?? 0;
            byYear.set(row.year, entry);
        }

        return [...byYear.entries()].map(([year, values]) => ({ year, ...values }));
    }
}
