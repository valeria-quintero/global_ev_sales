import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllSales } from "../api/ev-api";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";

//el motor no va en la clave: cambiarlo en los chips filtra en el navegador, sin pedir de nuevo al servidor
export function useEvRecords(parameter: string) {
    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    const query = useQuery({
        queryKey: ['ev-records', selectedRegions, selectedMode, yearRange],
        queryFn: async () => {
            //sales acepta una región por llamada
            const perRegion = await Promise.all(
                selectedRegions.map((region) => getAllSales({ region, mode: selectedMode, startYear: yearRange[0], endYear: yearRange[1] })),
            )
            return perRegion.flat()
        },
        enabled: selectedRegions.length > 0,
        staleTime: 30_000,
        placeholderData: keepPreviousData,
        //se queda solo con el parámetro elegido: mezclar ventas, stock y porcentajes no tiene sentido al sumar
        select: (rows) => rows.filter((row) => row.parameter === parameter),
    })

    return {
        records: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    }
}
