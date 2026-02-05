'use client'

import { useState } from 'react'
import { useOrderStore } from '@/stores/order-store'
import { Utensils, LayoutGrid, ShoppingCart, Search } from 'lucide-react'
// We will create these components next
import TableGrid from './table-grid'
import MenuGrid from './menu-grid'
import OrderSummary from './order-summary'

export default function WaiterPanel() {
    const selectedTable = useOrderStore((state) => state.selectedTable)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
            {/* Left Column: Tables & Menu */}
            <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden h-full">
                {/* Tables Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 shrink-0">
                    <div className="flex items-center gap-2 mb-4 text-slate-700">
                        <LayoutGrid size={20} />
                        <h2 className="font-bold text-lg">Seleccionar Mesa</h2>
                    </div>
                    <TableGrid />
                </div>

                {/* Menu Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-700">
                            <Utensils size={20} />
                            <h2 className="font-bold text-lg">Menú</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar plato..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <MenuGrid />
                    </div>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                    <ShoppingCart size={20} className="text-orange-600" />
                    <h2 className="font-bold text-lg text-slate-800">Pedido Actual</h2>
                    {selectedTable && (
                        <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            Mesa {selectedTable}
                        </span>
                    )}
                </div>

                <OrderSummary />
            </div>
        </div>
    )
}
