import type { RegionSummaryRow, TrendRow } from "../api/types"

type TrendsByPowertrain = Record<string, TrendRow[] | undefined>

//sin ventas no hay motor dominante
const NO_DOMINANT = '—'

//regions y powertrains son los elegidos por el usuario: solo se suman esos motores
export function buildRegionSummary(
    trendsByPowertrain: TrendsByPowertrain,
    regions: string[],
    powertrains: string[],
    latestYear: number,
    previousYear: number,
): RegionSummaryRow[] {
    //ventas de un motor en una región y año (0 si no hay dato)
    const valueOf = (powertrain: string, region: string, year: number) =>
        trendsByPowertrain[powertrain]?.find((row) => row.year === year)?.[region] ?? 0

    const totalOf = (region: string, year: number) =>
        powertrains.reduce((sum, powertrain) => sum + valueOf(powertrain, region, year), 0)

    return regions
        .map((region) => {
            const total = totalOf(region, latestYear)
            const previousTotal = totalOf(region, previousYear)

            const dominant = total > 0
                ? powertrains.reduce((best, powertrain) =>
                    valueOf(powertrain, region, latestYear) > valueOf(best, region, latestYear) ? powertrain : best,
                )
                : NO_DOMINANT

            return {
                region,
                total,
                //sin ventas el año anterior no se puede calcular el crecimiento
                growth: previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null,
                dominant,
            }
        })
        .sort((a, b) => b.total - a.total)
}
