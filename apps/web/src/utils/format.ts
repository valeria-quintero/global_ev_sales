const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always' })

const percentFormat = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
})

//para los ejes: 5000000 -> "5 M", 500000 -> "500 mil"
const compactFormat = new Intl.NumberFormat('es-ES', { notation: 'compact' })

export function formatCompact(value: number): string {
    return compactFormat.format(value)
}

export function formatNumber(value: number): string {
    return numberFormat.format(value)
}

//null = no se pudo calcular (el año anterior no tuvo ventas)
export function formatPercent(value: number | null): string {
    return value === null ? '—' : `${percentFormat.format(value)} %`
}
