'use client'

import { useEffect, useState } from 'react'
import { UsageIndicator } from '@/components/settings/usage-indicator'
import { UpgradeBanner } from '@/components/settings/upgrade-banner'
import { AddTableModal } from '@/components/settings/add-table-modal'
import { Loader2, LayoutGrid, QrCode } from 'lucide-react'

interface Table {
    id: string
    numero: number
    capacidad: number
    is_blockable: boolean
    is_blocked: boolean
}

interface UsageLimits {
    tables: {
        current: number
        max: number
        percentage: number
        canAdd: boolean
        isUnlimited: boolean
    }
}

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([])
    const [limits, setLimits] = useState<UsageLimits | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [limitsRes, tablesRes] = await Promise.all([
                fetch('/api/organization/limits'),
                fetch('/api/tables')
            ])

            const limitsData = await limitsRes.json()
            setLimits(limitsData)

            if (tablesRes.ok) {
                const tablesData = await tablesRes.json()
                setTables(tablesData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    const showWarning = limits && limits.tables.percentage >= 80 && !limits.tables.isUnlimited
    const atLimit = limits && !limits.tables.canAdd

    return (
        <div className="space-y-6">
            {/* Header with Usage */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Gestión de Mesas
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Administra las mesas de tu restaurante
                        </p>
                    </div>
                </div>

                {limits && (
                    <UsageIndicator
                        current={limits.tables.current}
                        max={limits.tables.max}
                        label="Mesas"
                        type="tables"
                        isUnlimited={limits.tables.isUnlimited}
                    />
                )}
            </div>

            {/* Warnings */}
            {(showWarning || atLimit) && (
                <UpgradeBanner
                    type={atLimit ? 'limit-reached' : 'warning'}
                    resourceType="mesas"
                />
            )}

            {/* Tables List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Mesas Actuales
                    </h3>
                    <button
                        disabled={atLimit || false}
                        onClick={() => setIsModalOpen(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${atLimit
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                            }`}
                    >
                        Agregar Mesa
                    </button>
                </div>

                {tables.length === 0 ? (
                    <div className="text-center py-12">
                        <LayoutGrid className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            No hay mesas registradas
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tables.map((table) => (
                            <div
                                key={table.id}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <LayoutGrid className="text-orange-600 dark:text-orange-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                Mesa {table.numero}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {table.capacidad} personas
                                            </p>
                                        </div>
                                    </div>
                                    <QrCode className="text-slate-400" size={20} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="flex-1 text-sm px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        Editar
                                    </button>
                                    <button className="text-sm px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Table Modal */}
            <AddTableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    )
}
