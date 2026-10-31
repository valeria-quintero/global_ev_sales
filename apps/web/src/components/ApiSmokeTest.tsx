// TEMPORAL: comprueba que el cliente, los hooks y el store funcionan juntos. Se borra al hacer las vistas reales.
import { useEvFilters } from "../hooks/use-ev-filters";
import { useEvTrends } from "../hooks/use-ev-trends";
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store";

export function ApiSmokeTest() {
    const { filters, isLoading: loadingFilters, error: filtersError } = useEvFilters()
    const area = useEvTrends('powertrain')
    const bars = useEvTrends('region')

    const selectedMode = useEvAnalyticsStore((s) => s.selectedMode)
    const setMode = useEvAnalyticsStore((s) => s.setMode)
    const resetFilters = useEvAnalyticsStore((s) => s.resetFilters)

    return (
        <div style={{ padding: 16, textAlign: 'left' }}>
            <h2>Prueba de API (temporal)</h2>

            <p>
                Modo actual: <b>{selectedMode}</b>{' '}
                <button onClick={() => setMode('Cars')}>Cars</button>{' '}
                <button onClick={() => setMode('Buses')}>Buses</button>{' '}
                <button onClick={resetFilters}>Restablecer</button>
            </p>

            <h3>Filtros</h3>
            {loadingFilters && <p>Cargando...</p>}
            {filtersError && <p>Error: {filtersError.message}</p>}
            {filters && (
                <p>
                    {filters.regions.length} regiones · motores: {filters.powertrains.join(', ')} ·
                    modos: {filters.modes.join(', ')} · años: {filters.years[0]}–{filters.years.at(-1)}
                </p>
            )}

            <h3>Trends por motor (AreaChart)</h3>
            {area.isLoading && <p>Cargando...</p>}
            {area.error && <p>Error: {area.error.message}</p>}
            <pre>{JSON.stringify(area.trends, null, 1)}</pre>

            <h3>Trends por región (BarChart)</h3>
            {bars.isLoading && <p>Cargando...</p>}
            {bars.error && <p>Error: {bars.error.message}</p>}
            <pre>{JSON.stringify(bars.trends, null, 1)}</pre>
        </div>
    )
}
