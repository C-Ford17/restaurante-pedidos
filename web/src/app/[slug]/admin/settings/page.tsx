'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import {
    Settings as SettingsIcon,
    Layers,
    CreditCard,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Smartphone,
    Banknote,
    Loader2
} from 'lucide-react'
import CategoryModal from '@/components/admin/category-modal'
import PaymentMethodModal from '@/components/admin/payment-method-modal'

interface Category {
    id: number
    name: string
    displayOrder: number
    active: boolean
    _count?: { menuItems: number }
}

interface PaymentMethod {
    id: number
    name: string
    label: string
    active: boolean
    isDigital: boolean
}

export default function AdminSettingsPage() {
    const { t } = useLanguage()
    const [activeTab, setActiveTab] = useState<'categories' | 'payment'>('categories')
    const [loading, setLoading] = useState(true)

    const [categories, setCategories] = useState<Category[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined)

    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>(undefined)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [catsRes, payRes] = await Promise.all([
                fetch('/api/admin/menu/categories'),
                fetch('/api/admin/settings/payment-methods')
            ])

            if (catsRes.ok) setCategories(await catsRes.json())
            if (payRes.ok) setPaymentMethods(await payRes.json())
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditCategory = (cat: Category) => {
        setSelectedCategory(cat)
        setCategoryModalOpen(true)
    }

    const handleDeleteCategory = async (id: number) => {
        if (!confirm(t('modal.confirm'))) return
        try {
            await fetch(`/api/admin/menu/categories/${id}`, { method: 'DELETE' })
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleEditPayment = (method: PaymentMethod) => {
        setSelectedMethod(method)
        setPaymentModalOpen(true)
    }

    const handleDeletePayment = async (id: number) => {
        if (!confirm(t('modal.confirm'))) return
        try {
            await fetch(`/api/admin/settings/payment-methods/${id}`, { method: 'DELETE' })
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <SettingsIcon className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('admin.settings')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('admin.settings.subtitle')}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'categories'
                        ? 'border-orange-600 text-orange-600 dark:text-orange-500'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Layers size={18} />
                    {t('admin.categories')}
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'payment'
                        ? 'border-orange-600 text-orange-600 dark:text-orange-500'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <CreditCard size={18} />
                    {t('admin.payment')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                </div>
            ) : activeTab === 'categories' ? (
                // Categories Section
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setSelectedCategory(undefined)
                                setCategoryModalOpen(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            {t('admin.categories.add')}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 text-sm text-slate-500">{cat.displayOrder}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{cat.name}</td>
                                            <td className="px-6 py-4">
                                                {cat.active ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                                        <CheckCircle2 size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                        <XCircle size={12} /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{cat._count?.menuItems || 0} items</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditCategory(cat)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                // Payment Methods Section
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setSelectedMethod(undefined)
                                setPaymentModalOpen(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            {t('admin.payment.add')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.isDigital ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                                        {method.isDigital ? <Smartphone size={24} /> : <Banknote size={24} />}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditPayment(method)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePayment(method.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                    {method.label}
                                </h3>
                                <p className="text-sm font-mono text-slate-400 mb-4">{method.name}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${method.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                        {method.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {method.isDigital ? 'Digital' : 'Physical'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CategoryModal
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                onSuccess={fetchData}
                category={selectedCategory}
            />

            <PaymentMethodModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSuccess={fetchData}
                method={selectedMethod}
            />
        </div>
    )
}
