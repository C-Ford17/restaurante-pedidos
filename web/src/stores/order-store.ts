import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrderItem {
    uniqueId: string // Frontend unique ID for list rendering
    id: number // Backend Item ID
    nombre: string
    precio: number
    cantidad: number
    notas?: string
    es_directo?: boolean
    // Add other properties as needed
}

interface OrderState {
    selectedTable: number | null
    currentOrder: OrderItem[]

    // Actions
    setSelectedTable: (tableId: number | null) => void
    addItem: (item: any) => void
    removeItem: (uniqueId: string) => void
    updateItemQuantity: (uniqueId: string, delta: number) => void
    updateItemNotes: (uniqueId: string, notes: string) => void
    clearOrder: () => void
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            selectedTable: null,
            currentOrder: [],

            setSelectedTable: (tableId) => set({ selectedTable: tableId }),

            addItem: (item) => set((state) => {
                const uniqueId = crypto.randomUUID()
                const newItem: OrderItem = {
                    uniqueId,
                    id: item.id,
                    nombre: item.nombre,
                    precio: Number(item.precio),
                    cantidad: 1,
                    notas: '',
                    es_directo: item.es_directo
                }
                return { currentOrder: [...state.currentOrder, newItem] }
            }),

            removeItem: (uniqueId) => set((state) => ({
                currentOrder: state.currentOrder.filter((i) => i.uniqueId !== uniqueId)
            })),

            updateItemQuantity: (uniqueId, delta) => set((state) => ({
                currentOrder: state.currentOrder.map((item) => {
                    if (item.uniqueId === uniqueId) {
                        const newQty = item.cantidad + delta
                        return newQty > 0 ? { ...item, cantidad: newQty } : item
                    }
                    return item
                })
            })),

            updateItemNotes: (uniqueId, notes) => set((state) => ({
                currentOrder: state.currentOrder.map((item) =>
                    item.uniqueId === uniqueId ? { ...item, notas: notes } : item
                )
            })),

            clearOrder: () => set({ currentOrder: [], selectedTable: null }),
        }),
        {
            name: 'order-storage', // unique name
        }
    )
)
