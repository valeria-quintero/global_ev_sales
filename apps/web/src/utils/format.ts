const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always' })

const percentFormat = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
})

export function formatNumber(value: number): string {
    return numberFormat.format(value)
}

//null = no se pudo calcular (el año anterior no tuvo ventas)
export function formatPercent(value: number | null): string {
    return value === null ? '—' : `${percentFormat.format(value)} %`
}
