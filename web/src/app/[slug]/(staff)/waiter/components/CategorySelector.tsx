
interface Category {
    id: string
    name: string
    active: boolean
    displayOrder: number
}

interface CategorySelectorProps {
    categories: Category[]
    selectedCategory: string
    setSelectedCategory: (category: string) => void
    t: any
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    t
}) => {
    return (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-2">
            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === 'all'
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                >
                    {t('category.all')}
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.name
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
