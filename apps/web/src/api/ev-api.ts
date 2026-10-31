import type { SalesResponse, TrendRow, FiltersResponse, SalesParams, TrendsParams } from "./types"

type QueryValue = string | number | string[] | undefined

//arma la URL
function buildQuery(params: Record<string, QueryValue>): string {
    const search = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) continue
        search.set(key, Array.isArray(value) ? value.join(',') : String(value))
    }

    const query = search.toString()
    return query ? `?${query}` : ''
}

export async function request<T>(path: string): Promise<T> {
    const response = await fetch(path)

    if (!response.ok) {
        throw new Error(`Error ${response.status}`)
    }

    return response.json() as Promise<T>
}


export function getSales(params: SalesParams = {}) {
    return request<SalesResponse>(`/api/ev/sales${buildQuery({ ...params })}`)
}

export function getFilters() {
    return request<FiltersResponse>('/api/ev/filters')
}

export function getTrends(params: TrendsParams = {}) {
    return request<TrendRow[]>(`/api/ev/trends${buildQuery({ ...params })}`)
}
