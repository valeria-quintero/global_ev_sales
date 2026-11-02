import { useState } from 'react'
import FiltersBar from './components/FiltersBar'
import RegionsSummaryTable from './components/RegionsSummaryTable'
import TabBar from './components/TabBar'
import PowertrainAreaChart from './components/charts/PowertrainAreaChart'

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'registros', label: 'Registros' },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  //la pestaña es estado de pantalla, no un filtro: no necesita el store global
  const [activeTab, setActiveTab] = useState<TabId>('resumen')

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            Monitor de Transición Energética
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ventas globales de vehículos eléctricos · Fuente: IEA Global EV Data
          </p>
        </header>

        {/* los filtros van fuera de las pestañas: afectan a todas */}
        <FiltersBar />

        <TabBar<TabId> tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'resumen' && <RegionsSummaryTable />}
          {activeTab === 'tendencias' && <PowertrainAreaChart />}
          {activeTab === 'registros' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Aquí irá la tabla de registros detallados con AG Grid.
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
