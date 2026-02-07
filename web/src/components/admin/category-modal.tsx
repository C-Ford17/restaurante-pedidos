'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { X, Save, Loader2, AlertCircle } from 'lucide-react'

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    category?: {
        id: number
        name: string
        displayOrder: number
        active: boolean
    }
}

export default function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: category?.name || '',
        displayOrder: category?.displayOrder || 0,
        active: category?.active ?? true
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = category
                ? `/api/admin/menu/categories/${category.id}`
                : '/api/admin/menu/categories'

            const method = category ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error saving category')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {category
                            ? t('admin.categories.edit')
                            : t('admin.categories.add')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('admin.categories.name')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g. Burgers, Drinks"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('admin.categories.order')}
                        </label>
                        <input
                            type="number"
                            value={formData.displayOrder}
                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('admin.categories.active')}
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            {t('modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {t('modal.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
