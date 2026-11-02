import { useState } from "react"
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"
import { useEvShareChart } from "../../hooks/use-ev-share-chart"
import { useEvAnalyticsStore } from "../../stores/use-ev-analytics-store"
import { niceTicks } from "../../utils/chart"
import { formatCompact, formatNumber } from "../../utils/format"

const tickStyle = { fill: 'var(--text-muted)', fontSize: 12 }

const formatShare = (value: number | null) => (value === null ? '—' : `${formatNumber(Math.round(value * 10) / 10)} %`)

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null

    const row = payload[0].payload as { volume: number; share: number | null }

    return (
        <div className="rounded-lg border border-(--border) bg-(--surface-1) px-3 py-2 text-xs shadow-md">
            <p className="mb-1 font-medium text-(--text-secondary)">{label}</p>
            <p className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--series-volume)' }} />
                <span className="font-semibold tabular-nums text-(--text-primary)">{formatNumber(row.volume)}</span>
                <span className="text-(--text-secondary)">Ventas</span>
            </p>
            <p className="flex items-center gap-2">
                <span className="inline-block h-0.5 w-3 rounded" style={{ background: 'var(--series-share)' }} />
                <span className="font-semibold tabular-nums text-(--text-primary)">{formatShare(row.share)}</span>
                <span className="text-(--text-secondary)">Cuota de ventas</span>
            </p>
        </div>
    )
}

export default function VolumeShareChart() {
    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)

    //este gráfico muestra una región a la vez, se elige entre las que están marcadas en los filtros
    const [chosenRegion, setChosenRegion] = useState('World')
    const region = selectedRegions.includes(chosenRegion) ? chosenRegion : selectedRegions[0]

    const { rows, isLoading, isFetching, error } = useEvShareChart(region)

    const volumeTicks = niceTicks(Math.max(0, ...(rows ?? []).map((row) => row.volume)))
    const shareTicks = niceTicks(Math.max(0, ...(rows ?? []).map((row) => row.share ?? 0)))

    return (
        <figure className="viz-root rounded-2xl border border-(--border) bg-(--surface-1) p-6 shadow-sm">
            <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-(--text-primary)">Ventas y cuota de mercado</h2>
                    <p className="text-sm text-(--text-secondary)">
                        {region} · {selectedMode} · BEV + PHEV · {yearRange[0]}–{yearRange[1]}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedRegions.length > 1 && (
                        <select
                            aria-label="Región del gráfico"
                            value={region}
                            onChange={(e) => setChosenRegion(e.target.value)}
                            className="rounded-lg border border-(--border) bg-(--surface-1) px-3 py-1.5 text-sm text-(--text-secondary)"
                        >
                            {selectedRegions.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </figcaption>

            {isLoading && <p className="py-16 text-center text-sm text-(--text-secondary)">Cargando...</p>}
            {error && <p className="py-16 text-center text-sm text-red-600">Error: {error.message}</p>}
            {rows && rows.length === 0 && (
                <p className="py-16 text-center text-sm text-(--text-secondary)">Sin datos para esta selección.</p>
            )}

            {rows && rows.length > 0 && (
                <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                    <ul className="mb-3 flex flex-wrap gap-4 text-sm text-(--text-secondary)">
                        <li className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--series-volume)' }} />
                            Ventas (vehículos)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="inline-block h-0.5 w-3 rounded" style={{ background: 'var(--series-share)' }} />
                            Cuota de ventas (%)
                        </li>
                    </ul>

                    <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid vertical={false} stroke="var(--grid)" />
                            <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: 'var(--axis)' }} tick={tickStyle} />
                            <YAxis
                                yAxisId="volume"
                                domain={[0, volumeTicks[volumeTicks.length - 1]]}
                                ticks={volumeTicks}
                                tickFormatter={formatCompact}
                                tickLine={false}
                                axisLine={false}
                                width={56}
                                tick={tickStyle}
                            />
                            <YAxis
                                yAxisId="share"
                                orientation="right"
                                domain={[0, shareTicks[shareTicks.length - 1]]}
                                ticks={shareTicks}
                                tickFormatter={(value: number) => `${value} %`}
                                tickLine={false}
                                axisLine={false}
                                width={48}
                                tick={{ ...tickStyle, fill: 'var(--series-share)' }}
                            />
                            <Tooltip content={ChartTooltip} cursor={{ fill: 'var(--grid)', opacity: 0.5 }} />
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill="var(--series-volume)"
                                fillOpacity={0.55}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={36}
                                isAnimationActive={false}
                            />
                            <Line
                                yAxisId="share"
                                dataKey="share"
                                type="monotone"
                                stroke="var(--series-share)"
                                strokeWidth={2}
                                dot={{ r: 4, fill: 'var(--series-share)', stroke: 'var(--surface-1)', strokeWidth: 2 }}
                                activeDot={{ r: 5, fill: 'var(--series-share)', stroke: 'var(--surface-1)', strokeWidth: 2 }}
                                connectNulls={false}
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </figure>
    )
}
