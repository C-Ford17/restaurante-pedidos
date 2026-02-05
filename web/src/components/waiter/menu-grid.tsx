'use client'

import { useState } from 'react'
import { useOrderStore } from '@/stores/order-store'
import { Plus, Clock } from 'lucide-react'
import { clsx } from 'clsx'

// Mock Data
const CATEGORIES = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres']
const MOCK_ITEMS = [
    { id: 1, nombre: 'Hamburguesa Clásica', precio: 15000, categoria: 'Platos Fuertes', tiempo: 15 },
    { id: 2, nombre: 'Papas Fritas', precio: 8000, categoria: 'Entradas', tiempo: 10 },
    { id: 3, nombre: 'Coca Cola', precio: 5000, categoria: 'Bebidas', tiempo: 2 },
    { id: 4, nombre: 'Tiramisu', precio: 12000, categoria: 'Postres', tiempo: 0 },
    { id: 5, nombre: 'Pizza Margarita', precio: 25000, categoria: 'Platos Fuertes', tiempo: 20 },
    { id: 6, nombre: 'Limonada', precio: 6000, categoria: 'Bebidas', tiempo: 5 },
]

export default function MenuGrid() {
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
    const addItem = useOrderStore((state) => state.addItem)
    const selectedTable = useOrderStore((state) => state.selectedTable)

    const filteredItems = MOCK_ITEMS.filter(item => item.categoria === activeCategory)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Categories Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                            activeCategory === cat
                                ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
                {filteredItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (selectedTable) {
                                addItem(item)
                            } else {
                                // Ideally show generic toast: "Select table first"
                                alert("Selecciona una mesa primero")
                            }
                        }}
                        className={clsx(
                            "flex flex-col bg-white border rounded-xl p-3 text-left transition-all relative overflow-hidden group",
                            selectedTable
                                ? "border-slate-200 hover:border-orange-400 hover:shadow-md cursor-pointer"
                                : "border-slate-100 opacity-60 cursor-not-allowed"
                        )}
                    >
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-orange-600 transition-colors">{item.nombre}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                <Clock size={12} />
                                <span>{item.tiempo} min</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-slate-900">${item.precio.toLocaleString()}</span>
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={14} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
