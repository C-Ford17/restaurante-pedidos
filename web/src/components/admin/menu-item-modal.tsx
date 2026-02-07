'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { X, Save, Loader2, AlertCircle, Upload, Plus, Trash2, ChevronDown, Clock, AlertTriangle, LinkIcon } from 'lucide-react'

interface Category {
    id: number
    name: string
}

interface InventoryItem {
    id: string
    name: string
    unit: string
}

interface Ingredient {
    inventoryItemId: string
    quantityRequired: number
}

interface MenuItemModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    categories: Category[]
    menuItem?: any // Using any for now to speed up, should type properly later
}

export default function MenuItemModal({ isOpen, onClose, onSuccess, categories, menuItem }: MenuItemModalProps) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'details' | 'recipe'>('details')

    // Inventory state
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [ingredients, setIngredients] = useState<Ingredient[]>(
        menuItem?.ingredients?.map((ing: any) => ({
            inventoryItemId: ing.inventoryItemId,
            quantityRequired: Number(ing.quantityRequired)
        })) || []
    )

    const [formData, setFormData] = useState({
        name: menuItem?.name || '',
        price: menuItem?.price || '',
        category: menuItem?.category || menuItem?.categoria || (categories[0]?.name || ''),
        description: menuItem?.description || '',
        estimatedTime: menuItem?.estimatedTime || 15,
        available: menuItem?.available ?? menuItem?.disponible ?? true,
        imageUrl: menuItem?.imageUrl || menuItem?.image_url || '',
        isDirect: menuItem?.isDirect ?? false,
        useInventory: menuItem?.useInventory ?? false,
        currentStock: menuItem?.currentStock || ''
    })

    // Fetch inventory items
    useEffect(() => {
        if (isOpen) {
            fetch('/api/admin/inventory')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setInventoryItems(data)
                })
                .catch(err => console.error('Error loading inventory:', err))
        }
    }, [isOpen])

    // Ensure default category is set
    useEffect(() => {
        if (!formData.category && categories.length > 0) {
            setFormData(prev => ({ ...prev, category: categories[0].name }))
        }
    }, [categories, formData.category])

    if (!isOpen) return null

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const data = await res.json()
            setFormData(prev => ({ ...prev, imageUrl: data.secure_url }))
        } catch (err: any) {
            console.error('Upload error:', err)
            setError('Image upload failed: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = menuItem
                ? `/api/admin/menu/${menuItem.id}`
                : '/api/admin/menu'

            const method = menuItem ? 'PUT' : 'POST'

            const payload = {
                ...formData,
                currentStock: formData.currentStock ? parseInt(formData.currentStock) : null,
                ingredients: formData.useInventory ? ingredients : []
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error saving item')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addIngredient = () => {
        setIngredients([...ingredients, { inventoryItemId: '', quantityRequired: 0 }])
    }

    const removeIngredient = (index: number) => {
        const newIngredients = [...ingredients]
        newIngredients.splice(index, 1)
        setIngredients(newIngredients)
    }

    const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
        const newIngredients = [...ingredients]
        newIngredients[index] = { ...newIngredients[index], [field]: value }
        setIngredients(newIngredients)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {menuItem ? t('admin.menu.edit') : t('admin.menu.add')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        {t('admin.menu.details')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('recipe')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'recipe'
                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        {t('admin.menu.recipe')}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="menu-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertTriangle size={20} />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {activeTab === 'details' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.price')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.category')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => {
                                                if (e.target.value === 'new') {
                                                    // Handle new category logic if needed, or open CategoryModal
                                                } else {
                                                    setFormData({ ...formData, category: e.target.value })
                                                }
                                            }}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                            {/* <option value="new">+ {t('admin.categories.add')}</option> */}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.time')} (min)
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="number"
                                            value={formData.estimatedTime}
                                            onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 0 })}
                                            className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {!formData.useInventory && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t('admin.menu.currentStock')}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.currentStock}
                                            onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                            placeholder="0"
                                        />
                                    </div>
                                )}

                                <div className="col-span-full space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.description')}
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 resize-none"
                                    />
                                </div>

                                <div className="col-span-full space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('admin.menu.image')}
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon size={16} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                className="w-full pl-10 pr-24 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                                                placeholder="https://..."
                                            />
                                            <div className="absolute right-1 top-1 bottom-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={uploading}
                                                />
                                                <button
                                                    type="button"
                                                    className="h-full px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                >
                                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                    <span className="text-xs">Upload</span>
                                                </button>
                                            </div>
                                        </div>
                                        {formData.imageUrl && (
                                            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-full flex flex-wrap gap-6 mt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="available"
                                            checked={formData.available}
                                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="available" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t('admin.menu.available')}
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isDirect"
                                            checked={formData.isDirect}
                                            onChange={(e) => setFormData({ ...formData, isDirect: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="isDirect" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t('admin.menu.isDirect')}
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="useInventory"
                                            checked={formData.useInventory}
                                            onChange={(e) => setFormData({ ...formData, useInventory: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="useInventory" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {t('admin.menu.useInventory')}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-md font-medium text-slate-900 dark:text-white">Recipe Ingredients</h3>
                                    <button
                                        type="button"
                                        onClick={addIngredient}
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Ingredient
                                    </button>
                                </div>

                                {ingredients.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                        No ingredients added yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex items-end gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-medium text-slate-500">Item</label>
                                                    <select
                                                        value={ing.inventoryItemId}
                                                        onChange={(e) => updateIngredient(idx, 'inventoryItemId', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-950 dark:text-white"
                                                    >
                                                        <option value="">Select Item</option>
                                                        {inventoryItems.map(item => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.name} ({item.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <label className="text-xs font-medium text-slate-500">Qty</label>
                                                    <input
                                                        type="number"
                                                        step="0.0001"
                                                        value={ing.quantityRequired}
                                                        onChange={(e) => updateIngredient(idx, 'quantityRequired', parseFloat(e.target.value))}
                                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-950 dark:text-white"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredient(idx)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {t('modal.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="menu-form"
                        disabled={loading || uploading}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('modal.save')}
                    </button>
                </div>
            </div>
        </div>
    )
}
