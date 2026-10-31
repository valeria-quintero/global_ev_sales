import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSales } from "../api/ev-api";
import type { SalesParams } from "../api/types";

export function useEvSales(params: SalesParams = {}) {
    const query = useQuery({
        queryKey: ['ev-sales', params],
        queryFn: () => getSales(params),
        staleTime: 30_000,
        //al cambiar de página, la tabla conserva las filas anteriores mientras carga las nuevas
        placeholderData: keepPreviousData,
    })

    return {
        sales: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}
