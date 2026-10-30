import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

const MAX_PAGE_SIZE = 200;

export interface FindSalesParams {
    region?: string;
    powertrain?: string;
    mode?: string;
    startYear?: number;
    endYear?: number;
    page: number;
    pageSize: number;
}

@Injectable()
export class EvSalesService {
    constructor (private readonly prismaService: PrismaService) {}

    async findFilters () {
        const [regions, powertrains, modes, years] = await Promise.all([
            this.prismaService.evSale.findMany({ distinct: ['region'], select: { region: true }, orderBy: { region: 'asc' } }),
            this.prismaService.evSale.findMany({ distinct: ['powertrain'], select: { powertrain: true }, orderBy: { powertrain: 'asc' } }),
            this.prismaService.evSale.findMany({ distinct: ['mode'], select: { mode: true }, orderBy: { mode: 'asc' } }),
            this.prismaService.evSale.findMany({ distinct: ['year'], select: { year: true }, orderBy: { year: 'asc' } }),
        ]);

        return {
            regions: regions.map((r) => r.region),
            powertrains: powertrains.map((r) => r.powertrain),
            modes: modes.map((r) => r.mode),
            years: years.map((r) => r.year),
        };
    }

    async findSales ({ region, powertrain, mode, startYear, endYear, page, pageSize }: FindSalesParams) {
        const take = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        const currentPage = Math.max(page, 1);

        const where: Prisma.EvSaleWhereInput = {
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
}
