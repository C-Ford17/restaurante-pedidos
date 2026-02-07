'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Package, Plus, Search, Edit, Trash2, ArrowUpDown, AlertCircle } from 'lucide-react'
import InventoryItemModal from '@/components/admin/inventory-modal'

interface InventoryItem {
    id: string
    name: string
    unit: string
    currentStock: number
    minStock: number
    costPerUnit: number
    updatedAt: string
}

export default function AdminInventoryPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<InventoryItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/inventory')
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (error) {
            console.error('Error loading inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item)
        setModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t('modal.confirm'))) return

        try {
            const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchItems()
            } else {
                alert('Error deleting item')
            }
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    const handleAdd = () => {
        setSelectedItem(undefined)
        setModalOpen(true)
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Package className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('admin.inventory')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('admin.inventory.subtitle')}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('admin.inventory.add')}</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('admin.menu.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No items found.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{item.unit}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {Number(item.currentStock).toFixed(2)}
                                            </div>
                                            {Number(item.currentStock) <= Number(item.minStock) && (
                                                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                    <AlertCircle size={12} /> Low Stock
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            ${Number(item.costPerUnit).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {Number(item.currentStock) <= 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    Out of Stock
                                                </span>
                                            ) : Number(item.currentStock) <= Number(item.minStock) ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InventoryItemModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchItems}
                item={selectedItem}
            />
        </div>
    )
}
