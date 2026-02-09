'use client'

import React from 'react'
import { LayoutGrid, Lock } from 'lucide-react'

interface Table {
    id: string
    number: string
    capacity: number
    status: string
}

interface TableSelectionProps {
    tables: Table[]
    activeOrders: any[]
    t: (key: string, params?: any) => string
    setSelectedTable: (table: Table) => void
    setActiveOrderId: (id: string | null) => void
    setCart: (cart: any[]) => void
    setOrderNote: (note: string) => void
    setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void
}

export const TableSelection: React.FC<TableSelectionProps> = ({
    tables,
    activeOrders,
    t,
    setSelectedTable,
    setActiveOrderId,
    setCart,
    setOrderNote,
    setNotification
}) => {
    return (
        <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <LayoutGrid size={16} />
                {t('waiter.select_table')}
            </h3>

            {tables.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    {t('waiter.no_tables')}
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {tables.map((table) => {
                        const isOccupied = table.status === 'ocupada'
                        return (
                            <button
                                key={table.id}
                                onClick={() => {
                                    if (isOccupied) {
                                        setNotification({
                                            type: 'error',
                                            message: t('waiter.table_occupied_edit_instead') || 'Table occupied. Use edit button below.'
                                        })
                                        return
                                    }
                                    setSelectedTable(table)
                                    setActiveOrderId(null)
                                    setCart([])
                                    setOrderNote('')
                                }}
                                className={`aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative ${isOccupied
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-500 opacity-90'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600'
                                    }`}
                            >
                                <span className={`text-2xl font-bold ${isOccupied ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                    {table.number}
                                </span>
                                <span className={`text-xs font-medium uppercase ${isOccupied ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {t('common.table')}
                                </span>
                                {isOccupied && (
                                    <div className="absolute top-2 right-2 text-red-500 dark:text-red-400">
                                        <Lock size={16} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
