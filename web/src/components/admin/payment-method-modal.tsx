'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { X, Save, Loader2, AlertCircle, Smartphone, Banknote } from 'lucide-react'

interface PaymentMethodModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    method?: {
        id: number
        name: string
        label: string
        active: boolean
        isDigital: boolean
    }
}

export default function PaymentMethodModal({ isOpen, onClose, onSuccess, method }: PaymentMethodModalProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        label: '',
        active: true,
        isDigital: false
    })

    useEffect(() => {
        if (method) {
            setFormData({
                name: method.name,
                label: method.label,
                active: method.active,
                isDigital: method.isDigital
            })
        } else {
            setFormData({
                name: '',
                label: '',
                active: true,
                isDigital: false
            })
        }
    }, [method, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = method
                ? `/api/admin/settings/payment-methods/${method.id}`
                : '/api/admin/settings/payment-methods'

            const requestMethod = method ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: requestMethod,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error saving payment method')
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
                        {method
                            ? t('admin.payment.edit')
                            : t('admin.payment.add')}
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
                            {t('admin.payment.name')}
                        </label>
                        <input
                            type="text"
                            required
                            disabled={!!method} // Cannot edit internal name
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                            placeholder="e.g. nequi, daviplata"
                        />
                        {method && <p className="text-xs text-slate-500">Internal name cannot be changed.</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('admin.payment.label')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g. Nequi, Credit Card"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setFormData({ ...formData, isDigital: false })}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!formData.isDigital ? 'border-orange-500' : 'border-slate-400'}`}>
                                {!formData.isDigital && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                            </div>
                            <Banknote size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.payment.physical')}</span>
                        </div>

                        <div className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setFormData({ ...formData, isDigital: true })}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.isDigital ? 'border-orange-500' : 'border-slate-400'}`}>
                                {formData.isDigital && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                            </div>
                            <Smartphone size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.payment.digital')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('admin.payment.active')}
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
