import { useMemo, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import { ModuleRegistry } from "ag-grid-community"
import type { ColDef } from "ag-grid-community"
import { AllEnterpriseModule } from "ag-grid-enterprise"
import type { EvSale } from "../api/types"
import { useEvRecords } from "../hooks/use-ev-records"
import { useEvAnalyticsStore } from "../stores/use-ev-analytics-store"
import { formatNumber } from "../utils/format"

//row grouping es una función de AG Grid Enterprise
ModuleRegistry.registerModules([AllEnterpriseModule])

const PARAMETERS = [
    { value: 'EV sales', label: 'Ventas por año', unit: 'vehículos' },
    { value: 'EV stock', label: 'Vehículos en circulación', unit: 'vehículos' },
    { value: 'EV sales share', label: '% de las ventas que son eléctricas', unit: '%' },
]

export default function DetailedRecords() {
    const [parameter, setParameter] = useState('EV sales')
    const selectedPowertrains = useEvAnalyticsStore((s) => s.selectedPowertrains)
    const { records, isLoading, isFetching, error } = useEvRecords(parameter)

    const isShare = parameter === 'EV sales share'

    //la cuota solo existe para el powertrain "EV" (total), así que los chips de motor no se aplican
    const rows = useMemo<EvSale[]>(
        () => (records ?? []).filter((row) => isShare || selectedPowertrains.includes(row.powertrain)),
        [records, selectedPowertrains, isShare],
    )

    const columnDefs = useMemo<ColDef<EvSale>[]>(() => [
        { field: 'region', headerName: 'Región', rowGroup: true, hide: true },
        { field: 'powertrain', headerName: 'Motor', rowGroup: true, hide: true },
        { field: 'year', headerName: 'Año', filter: 'agNumberColumnFilter', sort: 'desc' },
        { field: 'mode', headerName: 'Modo' },
        {
            field: 'value',
            headerName: isShare ? 'Ventas eléctricas (%)' : 'Valor',
            type: 'rightAligned',
            filter: 'agNumberColumnFilter',
            //los grupos suman sales y stock. una cuota no se suma, se promedia
            aggFunc: isShare ? 'avg' : 'sum',
            valueFormatter: ({ value }) => (value == null ? '' : formatNumber(Math.round(value * 10) / 10)),
        },
    ], [isShare])

    const defaultColDef = useMemo<ColDef<EvSale>>(() => ({
        flex: 1,
        minWidth: 110,
        filter: true,
        floatingFilter: true,
    }), [])

    const unit = PARAMETERS.find((p) => p.value === parameter)?.unit

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Registros detallados</h2>
                    <p className="text-sm text-slate-500">
                        {rows.length.toLocaleString('es-ES')} filas · agrupadas por región y motor · valores en {unit}
                    </p>
                </div>
                <select
                    aria-label="Parámetro"
                    value={parameter}
                    onChange={(e) => setParameter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                    {PARAMETERS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
            </header>

            {isLoading && <p className="py-16 text-center text-sm text-slate-500">Cargando...</p>}
            {error && <p className="py-16 text-center text-sm text-red-600">Error: {error.message}</p>}

            {records && (
                <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`} style={{ height: 520 }}>
                    <AgGridReact<EvSale>
                        rowData={rows}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        autoGroupColumnDef={{ headerName: 'Región / Motor', minWidth: 220 }}
                        groupDefaultExpanded={1}
                        pagination
                        paginationPageSize={50}
                        paginationPageSizeSelector={[25, 50, 100]}
                        getRowId={({ data }) => String(data.id)}
                    />
                </div>
            )}
        </section>
    )
}
