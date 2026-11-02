import type { KeyboardEvent } from "react"

interface TabBarProps<T extends string> {
    tabs: readonly { id: T; label: string }[]
    active: T
    onChange: (id: T) => void
}

export default function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
    //flechas izquierda y derecha cambian de pestaña, como en cualquier lista de pestañas accesible
    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
        if (step === 0) return
        event.preventDefault()
        const next = tabs[(index + step + tabs.length) % tabs.length]
        onChange(next.id)
        document.getElementById(`tab-${next.id}`)?.focus()
    }

    return (
        <div className="flex gap-1 border-b border-slate-200">
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    aria-selected={tab.id === active}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={tab.id === active ? 0 : -1}
                    onClick={() => onChange(tab.id)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        tab.id === active
                            ? 'border-blue-600 text-blue-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
