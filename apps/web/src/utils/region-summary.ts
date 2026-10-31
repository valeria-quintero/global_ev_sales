import type { RegionSummaryRow, TrendRow } from "../api/types"

//motores que se suman en "total vendido". No incluye 'EV': es el total de todos y duplicaría
export const SUMMARY_POWERTRAINS = ['BEV', 'PHEV', 'FCEV'] as const

//estas "regiones" son totales que se solapan con los países, así que no van como filas
export const AGGREGATE_REGIONS = ['World', 'Europe', 'EU27', 'Rest of the world']

type TrendsByPowertrain = Record<string, TrendRow[] | undefined>

export function buildRegionSummary(
    trendsByPowertrain: TrendsByPowertrain,
    regions: string[],
    latestYear: number,
    previousYear: number,
): RegionSummaryRow[] {
    //ventas de un motor en una región y año (0 si no hay dato)
    const valueOf = (powertrain: string, region: string, year: number) =>
        trendsByPowertrain[powertrain]?.find((row) => row.year === year)?.[region] ?? 0

    const totalOf = (region: string, year: number) =>
        SUMMARY_POWERTRAINS.reduce((sum, powertrain) => sum + valueOf(powertrain, region, year), 0)

    return regions
        .map((region) => {
            const total = totalOf(region, latestYear)
            const previousTotal = totalOf(region, previousYear)

            const dominant = SUMMARY_POWERTRAINS.reduce((best, powertrain) =>
                valueOf(powertrain, region, latestYear) > valueOf(best, region, latestYear) ? powertrain : best,
            )

            return {
                region,
                total,
                //sin ventas el año anterior no se puede calcular el crecimiento
                growth: previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null,
                dominant,
            }
        })
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total)
}
