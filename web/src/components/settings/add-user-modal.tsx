'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface AddUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
    const [loading, setLoading] = useState(false)
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'mesero'
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error al crear usuario')
            }

            onSuccess()
            onClose()
            setFormData({ name: '', username: '', password: '', role: 'mesero' })
        } catch (error) {
            console.error('Error creating user:', error)
            alert(error instanceof Error ? error.message : 'Error al crear usuario')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('usermodal.title')}
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
                            {t('usermodal.fullname')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('usermodal.username')}
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('usermodal.password')}
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('usermodal.role')}
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="mesero">{t('role.waiter') || 'Waiter'}</option>
                            <option value="cocinero">{t('role.cook') || 'Cook'}</option>
                            <option value="cajero">{t('role.cashier') || 'Cashier'}</option>
                        </select>
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
                            {loading ? t('modal.processing') : t('usermodal.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
