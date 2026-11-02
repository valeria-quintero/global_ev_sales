import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSales, getTrends } from "../api/ev-api";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";

//la cuota de mercado se calcula sobre BEV + PHEV, así que las barras usan esos mismos motores
const SHARE_POWERTRAINS = ['BEV', 'PHEV']

export interface VolumeShareRow {
    year: number,
    volume: number,
    share: number | null,
}

export function useEvShareChart(region: string) {
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)
    const [startYear, endYear] = yearRange

    const volumeQuery = useQuery({
        queryKey: ['ev-share-volume', region, selectedMode, yearRange],
        queryFn: () => getTrends({ regions: [region], powertrains: SHARE_POWERTRAINS, mode: selectedMode, startYear, endYear, groupBy: 'region' }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    })

    //la cuota vive en /sales: es la fila "EV sales share" del powertrain EV (un porcentaje, no se suma)
    const shareQuery = useQuery({
        queryKey: ['ev-share-percent', region, selectedMode, yearRange],
        queryFn: () => getSales({ region, powertrain: 'EV', mode: selectedMode, startYear, endYear, pageSize: 200 }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    })

    let rows: VolumeShareRow[] | undefined
    if (volumeQuery.data && shareQuery.data) {
        const shareByYear = new Map(
            shareQuery.data.data
                .filter((row) => row.parameter === 'EV sales share')
                .map((row) => [row.year, row.value]),
        )
        rows = volumeQuery.data.map((row) => ({
            year: row.year,
            volume: row[region] ?? 0,
            share: shareByYear.get(row.year) ?? null,
        }))
    }

    return {
        rows,
        isLoading: volumeQuery.isLoading || shareQuery.isLoading,
        isFetching: volumeQuery.isFetching || shareQuery.isFetching,
        error: volumeQuery.error ?? shareQuery.error,
    }
}
