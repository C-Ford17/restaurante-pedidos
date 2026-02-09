'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface EditTableModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    table: {
        id: number
        number: number
        capacity: number
        isBlockable: boolean
    } | null
}

export function EditTableModal({ isOpen, onClose, onSuccess, table }: EditTableModalProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        number: '',
        capacity: '',
        isBlockable: true
    })

    useEffect(() => {
        if (table) {
            setFormData({
                number: table.number.toString(),
                capacity: table.capacity.toString(),
                isBlockable: table.isBlockable ?? true
            })
        } else {
            setFormData({
                number: '',
                capacity: '',
                isBlockable: true
            })
        }
    }, [table])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!table) return

        setLoading(true)
        try {
            const response = await fetch(`/api/tables/${table.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: parseInt(formData.number),
                    capacity: parseInt(formData.capacity),
                    isBlockable: formData.isBlockable
                })
            })

            if (response.ok) {
                onSuccess()
                onClose()
            } else {
                const error = await response.json()
                alert(error.error || 'Error al actualizar mesa')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al actualizar mesa')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !table) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('settings.tables.edit')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('tablemodal.number')}
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('tablemodal.capacity')}
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isBlockable-edit"
                            checked={formData.isBlockable}
                            onChange={(e) => setFormData({ ...formData, isBlockable: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-700 cursor-pointer"
                        />
                        <label htmlFor="isBlockable-edit" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            {t('tablemodal.is_blockable') || 'Waiters can block (QR)'}
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? t('modal.processing') : t('modal.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
