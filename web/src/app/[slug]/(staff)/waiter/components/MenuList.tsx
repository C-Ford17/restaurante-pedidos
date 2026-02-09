import { Plus, Utensils, X } from 'lucide-react'
import Image from 'next/image'

interface MenuItem {
    id: string
    name: string
    price: number
    description: string | null
    imageUrl: string | null
    category: string
    available: boolean
    isDirect: boolean
    calculatedStock: number
}

interface MenuListProps {
    items: MenuItem[]
    addToCart: (item: MenuItem) => void
    cart: any[]
}

export const MenuList: React.FC<MenuListProps> = ({
    items,
    addToCart,
    cart
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 pb-20">
            {items.map((item) => {
                const inCart = cart.filter(i => i.id === item.id).reduce((acc, i) => acc + i.quantity, 0)
                const available = item.calculatedStock - inCart
                const isOutOfStock = available <= 0

                return (
                    <div
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 rounded-xl border p-3 flex gap-3 shadow-sm transition-all ${isOutOfStock
                                ? 'opacity-60 grayscale border-red-100 dark:border-red-900/30'
                                : 'border-slate-200 dark:border-slate-800 active:scale-[0.98]'
                            }`}
                        onClick={() => !isOutOfStock && addToCart(item)}
                    >
                        <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                            {item.imageUrl ? (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-orange-400">
                                    <Utensils size={24} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 flex-1">{item.name}</h3>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${isOutOfStock
                                            ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                        {available > 0 ? `${available} und` : 'AGOTADO'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {item.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-bold text-orange-600 dark:text-orange-400">
                                    ${parseFloat(item.price.toString()).toLocaleString()}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOutOfStock
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'
                                    }`}>
                                    {isOutOfStock ? <X size={16} /> : <Plus size={16} />}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
