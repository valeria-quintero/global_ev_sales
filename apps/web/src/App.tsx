import FiltersBar from './components/FiltersBar'
import RegionsSummaryTable from './components/RegionsSummaryTable'

function App() {
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

        <FiltersBar />
        <RegionsSummaryTable />
      </div>
    </main>
  )
}

export default App
