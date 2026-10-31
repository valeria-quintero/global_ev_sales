import { useEvFilters } from "../hooks/use-ev-filters"
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store"

//mercados principales: salen siempre como chips. El resto de regiones se añade desde el selector
const MAIN_REGIONS = ['China', 'USA', 'Europe', 'EU27', 'Japan', 'India']

//estas "regiones" son totales o bloques que se solapan con los países
const BLOCKS = ['World', 'Europe', 'EU27', 'Rest of the world']

const labelClass = "mb-2 block text-sm font-medium text-slate-600"
const selectClass = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"

interface ChipProps {
    label: string
    selected: boolean
    onClick: () => void
}

function Chip({ label, selected, onClick }: ChipProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
        >
            {label}
        </button>
    )
}

export default function FiltersBar() {
    const { filters, isLoading, error } = useEvFilters()

    const selectedRegions = useEvAnalyticsStore((s) => s.selectedRegions)
    const toggleRegion = useEvAnalyticsStore((s) => s.toggleRegion)
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const togglePowertrain = useEvAnalyticsStore((s) => s.togglePowertrain)
    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const setMode = useEvAnalyticsStore((s) => s.setMode)
    const yearRange = useEvAnalyticsStore((s) => s.yearRange)
    const setYearRange = useEvAnalyticsStore((s) => s.setYearRange)
    const resetFilters = useEvAnalyticsStore((s) => s.resetFilters)

    const [startYear, endYear] = yearRange

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    Restablecer
                </button>
            </header>

            {isLoading && <p className="text-sm text-slate-500">Cargando filtros...</p>}
            {error && <p className="text-sm text-red-600">Error: {error.message}</p>}

            {filters && (
                <div className="grid gap-6 md:grid-cols-2">
                    <fieldset>
                        <legend className={labelClass}>Regiones</legend>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* los principales y, además, cualquier otra región ya elegida (para poder quitarla) */}
                            {[
                                ...MAIN_REGIONS.filter((region) => filters.regions.includes(region)),
                                ...selectedRegions.filter((region) => !MAIN_REGIONS.includes(region)),
                            ].map((region) => (
                                <Chip
                                    key={region}
                                    label={region}
                                    selected={selectedRegions.includes(region)}
                                    onClick={() => toggleRegion(region)}
                                />
                            ))}
                            <select
                                aria-label="Añadir región"
                                value=""
                                onChange={(e) => e.target.value && toggleRegion(e.target.value)}
                                className={`${selectClass} py-1.5`}
                            >
                                <option value="" disabled>+ Añadir región</option>
                                <optgroup label="Totales y bloques">
                                    {BLOCKS.filter((r) => filters.regions.includes(r) && !selectedRegions.includes(r) && !MAIN_REGIONS.includes(r)).map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Países">
                                    {filters.regions
                                        .filter((r) => !BLOCKS.includes(r) && !MAIN_REGIONS.includes(r) && !selectedRegions.includes(r))
                                        .map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                </optgroup>
                            </select>
                        </div>
                        {selectedRegions.includes('Europe') && selectedRegions.includes('EU27') && (
                            <p className="mt-2 text-xs text-amber-600">
                                Europe ya incluye a EU27: si los sumas, se cuenta dos veces.
                            </p>
                        )}
                    </fieldset>

                    <fieldset>
                        <legend className={labelClass}>Powertrain</legend>
                        <div className="flex flex-wrap gap-2">
                            {/* 'EV' es el total de todos los motores, no un motor */}
                            {filters.powertrains.filter((p) => p !== 'EV').map((powertrain) => (
                                <Chip
                                    key={powertrain}
                                    label={powertrain}
                                    selected={selectedPowertrains.includes(powertrain)}
                                    onClick={() => togglePowertrain(powertrain)}
                                />
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className={labelClass}>Modo</legend>
                        <div className="flex flex-wrap gap-2">
                            {filters.modes.map((mode) => (
                                <Chip
                                    key={mode}
                                    label={mode}
                                    selected={mode === selectedMode}
                                    onClick={() => setMode(mode)}
                                />
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className={labelClass}>Años</legend>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <label htmlFor="start-year">Desde</label>
                            <select
                                id="start-year"
                                value={startYear}
                                onChange={(e) => setYearRange([Number(e.target.value), endYear])}
                                className={selectClass}
                            >
                                {filters.years.filter((year) => year <= endYear).map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <label htmlFor="end-year">hasta</label>
                            <select
                                id="end-year"
                                value={endYear}
                                onChange={(e) => setYearRange([startYear, Number(e.target.value)])}
                                className={selectClass}
                            >
                                {filters.years.filter((year) => year >= startYear).map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </fieldset>
                </div>
            )}
        </section>
    )
}
