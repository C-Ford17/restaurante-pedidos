'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Image as ImageIcon,
    ChefHat,
    Loader2
} from 'lucide-react'
import MenuItemModal from '@/components/admin/menu-item-modal'

interface Category {
    id: number
    name: string
}

interface MenuItem {
    id: string
    name: string
    price: number
    category: string
    available: boolean
    imageUrl?: string
    description?: string
    categoryRel?: Category
}

export default function AdminMenuPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>(undefined)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [itemsRes, catsRes] = await Promise.all([
                fetch('/api/admin/menu'),
                fetch('/api/admin/menu/categories')
            ])

            if (itemsRes.ok) {
                const data = await itemsRes.json()
                setMenuItems(data)
            }

            if (catsRes.ok) {
                const data = await catsRes.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Error fetching menu data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item: MenuItem) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t('modal.confirm'))) return

        try {
            const res = await fetch(`/api/admin/menu/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory || item.categoryRel?.name === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Group by category for display
    const groupedItems = filteredItems.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {} as Record<string, MenuItem[]>)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('admin.menu')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('admin.menu.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedItem(undefined)
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('admin.menu.add')}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('admin.menu.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">{t('admin.filter.allCategories')}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-600" size={32} />
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <ChefHat size={20} className="text-orange-500" />
                                {category}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-all">
                                        <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}

                                            {!item.available && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        {t('admin.menu.unavailable')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                    {item.name}
                                                </h4>
                                                <span className="font-bold text-orange-600">
                                                    ${parseFloat(item.price.toString()).toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                                                {item.description || t('admin.menu.noDescription')}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {item.category}
                                                </span>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            {t('admin.menu.noItems')}
                        </div>
                    )}
                </div>
            )}

            <MenuItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                categories={categories}
                menuItem={selectedItem}
            />
        </div>
    )
}
