import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTrends } from "../api/ev-api";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";

//el ejercicio compara siempre estas tres regiones, sin importar las que haya elegido el usuario en los chips
export const COMPARED_REGIONS = ['China', 'Europe', 'USA']
const YEARS_SHOWN = 5

export function useEvCountriesComparison() {
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    //los últimos 5 años del rango elegido (si el rango es más corto, se usa completo)
    const endYear = yearRange[1]
    const startYear = Math.max(yearRange[0], endYear - YEARS_SHOWN + 1)

    const query = useQuery({
        queryKey: ['ev-countries-comparison', selectedPowertrains, selectedMode, startYear, endYear],
        queryFn: () => getTrends({
            regions: COMPARED_REGIONS,
            powertrains: selectedPowertrains,
            mode: selectedMode,
            startYear,
            endYear,
            groupBy: 'region',
        }),
        enabled: selectedPowertrains.length > 0,
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    })

    return {
        trends: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        startYear,
        endYear,
    }
}
