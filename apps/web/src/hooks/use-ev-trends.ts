import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTrends } from "../api/ev-api";
import type { GroupBy } from "../api/types";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";

export function useEvTrends(groupBy: GroupBy) {
    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    const query = useQuery({
        //groupBy va en la clave: el AreaChart (powertrain) y el BarChart (region) no deben compartir caché
        queryKey: ['ev-trends', groupBy, selectedRegions, selectedPowertrains, selectedMode, yearRange],
        queryFn: () => getTrends({
            regions: selectedRegions,
            powertrains: selectedPowertrains,
            mode: selectedMode,
            startYear: yearRange[0],
            endYear: yearRange[1],
            groupBy,
        }),
        //sin regiones o motores, buildQuery omitiría el parámetro y el backend usaría sus valores por defecto
        enabled: selectedRegions.length > 0 && selectedPowertrains.length > 0,
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    })

    return {
        trends: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}
