import { useQuery } from "@tanstack/react-query";
import { getFilters } from "../api/ev-api";

export function useEvFilters() {
    const query = useQuery({
        queryKey: ['ev-filters'],
        queryFn: getFilters,
        staleTime: Infinity,
    })

    return {
        filters: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}