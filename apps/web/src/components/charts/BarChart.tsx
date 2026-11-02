import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"
import { COMPARED_REGIONS, useEvCountriesComparison } from "../../hooks/use-ev-countries-comparison"
import { useEvAnalyticsStore } from "../../stores/use-ev-analytics-store"
import { niceTicks, seriesColor } from "../../utils/chart"
import { formatCompact, formatNumber } from "../../utils/format"

const tickStyle = { fill: 'var(--text-muted)', fontSize: 12 }

//un solo cuadro con las tres regiones del año que está bajo el puntero
function ChartTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-lg border border-(--border) bg-(--surface-1) px-3 py-2 text-xs shadow-md">
            <p className="mb-1 font-medium text-(--text-secondary)">{label}</p>
            {payload.map((entry) => {
                const key = String(entry.dataKey)
                return (
                    <p key={key} className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seriesColor(key) }} />
                        <span className="font-semibold tabular-nums text-(--text-primary)">{formatNumber(Number(entry.payload?.[key] ?? 0))}</span>
                        <span className="text-(--text-secondary)">{key}</span>
                    </p>
                )
            })}
        </div>
    )
}

export default function CountriesBarChart() {
    const { trends, isLoading, isFetching, error, startYear, endYear } = useEvCountriesComparison()
    const [showTable, setShowTable] = useState(false)

    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)

    const barMax = Math.max(0, ...(trends ?? []).flatMap((row) => COMPARED_REGIONS.map((key) => row[key] ?? 0)))
    const ticks = niceTicks(barMax)

    return (
        <figure className="viz-root rounded-2xl border border-(--border) bg-(--surface-1) p-6 shadow-sm">
            <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-(--text-primary)">China, Europa y EE. UU.</h2>
                    <p className="text-sm text-(--text-secondary)">
                        {selectedPowertrains.join(' + ')} · {selectedMode} · {startYear}–{endYear} · vehículos vendidos por año
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
                <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                    <ul className="mb-3 flex flex-wrap gap-4 text-sm text-(--text-secondary)">
                        {COMPARED_REGIONS.map((key) => (
                            <li key={key} className="flex items-center gap-2">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seriesColor(key) }} />
                                {key}
                            </li>
                        ))}
                    </ul>

                    {showTable ? (
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 border-b border-(--border) bg-(--surface-1) text-xs uppercase tracking-wide text-(--text-muted)">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Año</th>
                                        {COMPARED_REGIONS.map((key) => (
                                            <th key={key} className="px-4 py-2 text-right font-semibold">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--grid)">
                                    {trends.map((row) => (
                                        <tr key={row.year}>
                                            <td className="px-4 py-2 font-medium text-(--text-primary)">{row.year}</td>
                                            {COMPARED_REGIONS.map((key) => (
                                                <td key={key} className="px-4 py-2 text-right tabular-nums text-(--text-secondary)">
                                                    {formatNumber(row[key] ?? 0)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={trends} barGap={2} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                                <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--grid)', opacity: 0.5 }} />
                                {COMPARED_REGIONS.map((key) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        fill={seriesColor(key)}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={36}
                                        isAnimationActive={false}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}
        </figure>
    )
}
