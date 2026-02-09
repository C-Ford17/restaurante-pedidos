'use client'

import React from 'react'
import { BellRing, CheckCircle2 } from 'lucide-react'

interface ReadyItem {
    id: string
    quantity: number
    menuItem?: {
        name: string
    }
    order?: {
        tableNumber: string
    }
}

interface ReadyItemsProps {
    readyItems: ReadyItem[]
    t: (key: string, params?: any) => string
    handleServeAll: (items: ReadyItem[]) => void
    handleUpdateItemStatus: (id: string, status: string) => void
    isSubmitting: boolean
}

export const ReadyItems: React.FC<ReadyItemsProps> = ({
    readyItems,
    t,
    handleServeAll,
    handleUpdateItemStatus,
    isSubmitting
}) => {
    if (readyItems.length === 0) return null

    const groupedItems = Object.values(
        readyItems.reduce((acc: any, item: any) => {
            const key = item.order?.tableNumber || '0'
            if (!acc[key]) acc[key] = { tableNumber: key, items: [] }
            acc[key].items.push(item)
            return acc
        }, {})
    )

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <BellRing size={20} className="text-green-500" />
                {t('waiter.items_ready')}
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                    {readyItems.length}
                </span>
            </h3>
            <div className="space-y-3">
                {groupedItems.map((group: any) => (
                    <div key={group.tableNumber} className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-green-800 dark:text-green-400 text-sm">
                                {t('common.table')} {group.tableNumber}
                            </span>
                            <button
                                onClick={() => handleServeAll(group.items)}
                                disabled={isSubmitting}
                                className="text-xs font-bold uppercase bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                            >
                                {t('waiter.serve_all') || 'Servir Todo'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {group.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                            {item.quantity}x
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {item.menuItem?.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateItemStatus(item.id, 'servido')}
                                        className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shadow-sm"
                                        title={t('waiter.mark_served') || 'Marcar como servido'}
                                    >
                                        <CheckCircle2 size={24} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
