import { useEvRegionSummary } from "../hooks/use-ev-region-summary"
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store"
import { formatNumber, formatPercent } from "../utils/format"

export default function RegionsSummaryTable() {
    const { rows, year, isLoading, error } = useEvRegionSummary()
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Resumen
                    </h2>
                    <p className="text-sm text-slate-500">
                        {year} - total vendido, crecimiento porcentual y vehículo dominante.
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedMode} · {selectedPowertrains.join(' + ')}
                </span>
            </header>

            {isLoading && <p className="px-6 pb-6 text-sm text-slate-500">Cargando...</p>}
            {error && <p className="px-6 pb-6 text-sm text-red-600">Error: {error.message}</p>}
            {!isLoading && !error && rows.length === 0 && (
                <p className="px-6 pb-6 text-sm text-slate-500">Sin datos para este modo.</p>
            )}

            {rows.length > 0 && (
                <div className="max-h-[32rem] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold">Región</th>
                                <th className="px-6 py-3 text-right font-semibold">Total vendido</th>
                                <th className="px-6 py-3 text-right font-semibold">Crecimiento</th>
                                <th className="px-6 py-3 text-left font-semibold">Dominante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row) => (
                                <tr key={row.region} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{row.region}</td>
                                    <td className="px-6 py-3 text-right tabular-nums text-slate-700">
                                        {formatNumber(row.total)}
                                    </td>
                                    <td className={`px-6 py-3 text-right tabular-nums font-medium ${growthColor(row.growth)}`}>
                                        {formatPercent(row.growth)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                            {row.dominant}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

//verde si sube, rojo si baja, gris si no hay dato o no cambió
function growthColor(growth: number | null) {
    if (growth === null || growth === 0) return 'text-slate-400'
    return growth > 0 ? 'text-emerald-600' : 'text-red-600'
}
