import { useQueries } from "@tanstack/react-query";
import { getTrends } from "../api/ev-api";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";
import { AGGREGATE_REGIONS, SUMMARY_POWERTRAINS, buildRegionSummary } from "../utils/region-summary";
import { useEvFilters } from "./use-ev-filters";

//resumen por región del último año
export function useEvRegionSummary() {
    const { filters, isLoading: filtersLoading, error: filtersError } = useEvFilters()
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)

    const latestYear = filters?.years.at(-1)
    const previousYear = latestYear === undefined ? undefined : latestYear - 1
    const regions = filters?.regions.filter((region) => !AGGREGATE_REGIONS.includes(region))

    //una consulta por motor
    const queries = useQueries({
        queries: SUMMARY_POWERTRAINS.map((powertrain) => ({
            queryKey: ['ev-summary', powertrain, selectedMode, latestYear],
            queryFn: () => getTrends({
                regions,
                powertrains: [powertrain],
                mode: selectedMode,
                startYear: previousYear,
                endYear: latestYear,
                groupBy: 'region',
            }),
            enabled: latestYear !== undefined && regions !== undefined,
            staleTime: 30_000,
        })),
    })

    const allLoaded = queries.every((query) => query.data !== undefined)

    const rows = allLoaded && latestYear !== undefined && previousYear !== undefined && regions
        ? buildRegionSummary(
            Object.fromEntries(SUMMARY_POWERTRAINS.map((powertrain, i) => [powertrain, queries[i].data])),
            regions,
            latestYear,
            previousYear,
        )
        : []

    return {
        rows,
        year: latestYear,
        isLoading: filtersLoading || queries.some((query) => query.isLoading),
        error: filtersError ?? queries.find((query) => query.error)?.error ?? null,
    }
}
