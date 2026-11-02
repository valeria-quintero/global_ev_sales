import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"
import { useEvTrends } from "../../hooks/use-ev-trends"
import { useEvAnalyticsStore } from "../../stores/use-ev-analytics-store"
import { niceTicks, seriesColor, sortSeries } from "../../utils/chart"
import { formatCompact, formatNumber } from "../../utils/format"

const tickStyle = { fill: 'var(--text-muted)', fontSize: 12 }

//un solo cuadro con todas las series en ese año: el puntero no tiene que caer sobre una franja
function ChartTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null

    //de arriba hacia abajo, en el mismo orden en que se apilan
    const rows = [...payload].reverse().map((entry) => {
        const key = String(entry.dataKey)
        return { key, value: Number(entry.payload?.[key] ?? 0) }
    })
    const total = rows.reduce((sum, row) => sum + row.value, 0)

    return (
        <div className="rounded-lg border border-(--border) bg-(--surface-1) px-3 py-2 text-xs shadow-md">
            <p className="mb-1 font-medium text-(--text-secondary)">{label}</p>
            {rows.map((row) => (
                <p key={row.key} className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-3 rounded" style={{ background: seriesColor(row.key) }} />
                    <span className="font-semibold tabular-nums text-(--text-primary)">{formatNumber(row.value)}</span>
                    <span className="text-(--text-secondary)">{row.key}</span>
                </p>
            ))}
            {rows.length > 1 && (
                <p className="mt-1 border-t border-(--border) pt-1 text-(--text-secondary)">
                    Total <span className="font-semibold tabular-nums text-(--text-primary)">{formatNumber(total)}</span>
                </p>
            )}
        </div>
    )
}

export default function PowertrainAreaChart() {
    const { trends, isLoading, isFetching, error } = useEvTrends('powertrain')
    const [showTable, setShowTable] = useState(false)

    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    //las series salen de los datos que se están mostrando, así nunca difieren del dibujo
    const series = sortSeries(trends?.[0] ? Object.keys(trends[0]).filter((key) => key !== 'year') : [])

    //el tope del eje Y es el mayor total apilado de todos los años
    const stackMax = Math.max(0, ...(trends ?? []).map((row) => series.reduce((sum, key) => sum + (row[key] ?? 0), 0)))
    const ticks = niceTicks(stackMax)

    const regionsLabel = selectedRegions.length === 1 && selectedRegions[0] === 'World'
        ? 'Global (World)'
        : selectedRegions.join(' + ')

    return (
        <figure className="viz-root rounded-2xl border border-(--border) bg-(--surface-1) p-6 shadow-sm">
            <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-(--text-primary)">Ventas por powertrain</h2>
                    <p className="text-sm text-(--text-secondary)">
                        {regionsLabel} · {selectedMode} · {yearRange[0]}–{yearRange[1]} · vehículos vendidos por año
                    </p>
                </div>
                <button
                    type="button"
                    aria-pressed={showTable}
                    onClick={() => setShowTable((value) => !value)}
                    className="rounded-lg border border-(--border) px-3 py-1.5 text-sm font-medium text-(--text-secondary) hover:bg-(--grid)"
                >
                    {showTable ? 'Ver gráfico' : 'Ver tabla'}
                </button>
            </figcaption>

            {isLoading && <p className="py-16 text-center text-sm text-(--text-secondary)">Cargando...</p>}
            {error && <p className="py-16 text-center text-sm text-red-600">Error: {error.message}</p>}
            {trends && trends.length === 0 && (
                <p className="py-16 text-center text-sm text-(--text-secondary)">Sin datos para esta selección.</p>
            )}

            {trends && trends.length > 0 && (
                //mientras se recarga, el gráfico conserva su forma y solo se atenúa
                <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                    {series.length > 1 && (
                        <ul className="mb-3 flex flex-wrap gap-4 text-sm text-(--text-secondary)">
                            {series.map((key) => (
                                <li key={key} className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seriesColor(key) }} />
                                    {key}
                                </li>
                            ))}
                        </ul>
                    )}

                    {showTable ? (
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 border-b border-(--border) bg-(--surface-1) text-xs uppercase tracking-wide text-(--text-muted)">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Año</th>
                                        {series.map((key) => (
                                            <th key={key} className="px-4 py-2 text-right font-semibold">{key}</th>
                                        ))}
                                        {series.length > 1 && <th className="px-4 py-2 text-right font-semibold">Total</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--grid)">
                                    {trends.map((row) => (
                                        <tr key={row.year}>
                                            <td className="px-4 py-2 font-medium text-(--text-primary)">{row.year}</td>
                                            {series.map((key) => (
                                                <td key={key} className="px-4 py-2 text-right tabular-nums text-(--text-secondary)">
                                                    {formatNumber(row[key] ?? 0)}
                                                </td>
                                            ))}
                                            {series.length > 1 && (
                                                <td className="px-4 py-2 text-right tabular-nums font-medium text-(--text-primary)">
                                                    {formatNumber(series.reduce((sum, key) => sum + (row[key] ?? 0), 0))}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={trends} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} stroke="var(--grid)" />
                                <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: 'var(--axis)' }} tick={tickStyle} />
                                <YAxis
                                    domain={[0, ticks[ticks.length - 1]]}
                                    ticks={ticks}
                                    tickFormatter={formatCompact}
                                    tickLine={false}
                                    axisLine={false}
                                    width={56}
                                    tick={tickStyle}
                                />
                                <Tooltip content={ChartTooltip} cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }} />
                                {series.map((key) => (
                                    <Area
                                        key={key}
                                        dataKey={key}
                                        type="monotone"
                                        stackId="powertrain"
                                        stroke={seriesColor(key)}
                                        strokeWidth={2}
                                        fill={seriesColor(key)}
                                        fillOpacity={0.12}
                                        activeDot={{ r: 4, fill: seriesColor(key), stroke: 'var(--surface-1)', strokeWidth: 2 }}
                                        isAnimationActive={false}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}
        </figure>
    )
}
