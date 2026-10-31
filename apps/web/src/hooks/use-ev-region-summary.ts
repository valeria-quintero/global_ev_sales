import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { getTrends } from "../api/ev-api";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";
import { buildRegionSummary } from "../utils/region-summary";

//resumen por región del último año del rango elegido, comparado con el año anterior.
//Obedece a los filtros del store: regiones, motores, modo y año final
export function useEvRegionSummary() {
    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    const year = yearRange[1]
    const previousYear = year - 1

    //una consulta por motor: así se sabe cuál domina en cada región
    const queries = useQueries({
        queries: selectedPowertrains.map((powertrain) => ({
            queryKey: ['ev-summary', powertrain, selectedRegions, selectedMode, year],
            queryFn: () => getTrends({
                regions: selectedRegions,
                powertrains: [powertrain],
                mode: selectedMode,
                startYear: previousYear,
                endYear: year,
                groupBy: 'region' as const,
            }),
            staleTime: 30_000,
            placeholderData: keepPreviousData,
        })),
    })

    const allLoaded = queries.every((query) => query.data !== undefined)

    const rows = allLoaded
        ? buildRegionSummary(
            Object.fromEntries(selectedPowertrains.map((powertrain, i) => [powertrain, queries[i].data])),
            selectedRegions,
            selectedPowertrains,
            year,
            previousYear,
        )
        : []

    return {
        rows,
        year,
        isLoading: queries.some((query) => query.isLoading),
        error: queries.find((query) => query.error)?.error ?? null,
    }
}
