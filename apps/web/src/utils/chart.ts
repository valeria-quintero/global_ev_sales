//el color sigue a la entidad, no a su posición: si el usuario quita BEV, PHEV sigue siendo naranja
const SERIES_COLORS: Record<string, string> = {
    BEV: 'var(--series-bev)',
    PHEV: 'var(--series-phev)',
    FCEV: 'var(--series-fcev)',
    China: 'var(--series-china)',
    Europe: 'var(--series-europe)',
    USA: 'var(--series-usa)',
}

export function seriesColor(series: string): string {
    return SERIES_COLORS[series] ?? 'var(--text-muted)'
}

//orden fijo de apilado, de menor a mayor volumen: FCEV vende miles y BEV o PHEV millones.
//Si FCEV fuera encima, su línea tapa la de BEV y la franja azul parecería verde
const STACK_ORDER = ['FCEV', 'BEV', 'PHEV']

export function sortSeries(series: string[]): string[] {
    const rank = (key: string) => (STACK_ORDER.includes(key) ? STACK_ORDER.indexOf(key) : STACK_ORDER.length)
    return [...series].sort((a, b) => rank(a) - rank(b))
}

//marcas "redondas" para un eje que empieza en 0 (0, 5M, 10M, 15M) en vez de las que calcula Recharts (3,5M, 7M, 11M)
export function niceTicks(max: number, target = 5): number[] {
    if (max <= 0) return [0, 1]

    const rough = max / target
    const magnitude = 10 ** Math.floor(Math.log10(rough))
    const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude
    const top = Math.ceil(max / step) * step

    return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
}
