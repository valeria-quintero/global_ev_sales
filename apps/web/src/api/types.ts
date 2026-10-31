export interface EvSale {
    id: number,
    region: string,
    category: string,
    parameter: string,
    mode: string,
    powertrain: string,
    year: number,
    unit: string,
    value: number,
}

export interface SalesResponse {
    data: EvSale[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number,
}

export interface FiltersResponse {
    regions: string[],
    powertrains: string[],
    modes: string[],
    years: number[],
}

export interface TrendRow {
    year: number,
    [serie: string]: number,
}

export type GroupBy = 'powertrain' | 'region'

//parámetros que acepta GET /api/ev/sales (todos opcionales)
export interface SalesParams {
    region?: string,
    powertrain?: string,
    mode?: string,
    category?: string,
    startYear?: number,
    endYear?: number,
    page?: number,
    pageSize?: number,
}

//parámetros que acepta GET /api/ev/trends (todos opcionales)
export interface TrendsParams {
    regions?: string[],
    powertrains?: string[],
    mode?: string,
    startYear?: number,
    endYear?: number,
    groupBy?: GroupBy,
}
