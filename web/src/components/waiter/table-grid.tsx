'use client'

import { useOrderStore } from '@/stores/order-store'
import { clsx } from 'clsx'

// Mock Data
export const MOCK_TABLES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    estado: Math.random() > 0.8 ? 'ocupada' : 'libre' // 20% occupied
}))

export default function TableGrid() {
    const selectedTable = useOrderStore((state) => state.selectedTable)
    const setSelectedTable = useOrderStore((state) => state.setSelectedTable)

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {MOCK_TABLES.map((mesa) => (
                <button
                    key={mesa.id}
                    onClick={() => setSelectedTable(mesa.id === selectedTable ? null : mesa.id)}
                    className={clsx(
                        "h-24 rounded-xl flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden",
                        selectedTable === mesa.id
                            ? "bg-orange-600 border-orange-600 text-white shadow-lg scale-105 z-10"
                            : mesa.estado === 'ocupada'
                                ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-70"
                                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                    )}
                    disabled={mesa.estado === 'ocupada'}
                >
                    <span className="text-xs uppercase font-bold tracking-wider opacity-80">Mesa</span>
                    <span className="text-2xl font-black">{mesa.numero}</span>
                    {mesa.estado === 'ocupada' && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </button>
            ))}
        </div>
    )
}
