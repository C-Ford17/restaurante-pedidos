import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Ably from 'ably'

interface Table {
    id: string
    number: string
    capacity: number
    status: string
}

interface Category {
    id: string
    name: string
    active: boolean
    displayOrder: number
}

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

export const useWaiterData = () => {
    const { data: session, status } = useSession()

    // Data states
    const [tables, setTables] = useState<Table[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [activeOrders, setActiveOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const fetchData = useCallback(async () => {
        // Don't set loading on poll if we already have tables
        if (tables.length === 0) setLoading(true)

        try {
            const [tablesRes, categoriesRes, menuRes, ordersRes] = await Promise.all([
                fetch('/api/tables'),
                fetch('/api/admin/menu/categories'),
                fetch('/api/admin/menu'),
                fetch('/api/orders?status=nuevo,en_cocina,listo,servido,listo_pagar')
            ])

            if (!tablesRes.ok || !categoriesRes.ok || !menuRes.ok) throw new Error('Failed to fetch data')

            const tablesData = await tablesRes.json()
            const categoriesData = await categoriesRes.json()
            const menuData = await menuRes.json()

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json()
                setActiveOrders(ordersData)
            }

            if (Array.isArray(tablesData)) setTables(tablesData)
            if (Array.isArray(categoriesData)) setCategories(categoriesData)
            if (Array.isArray(menuData)) setMenuItems(menuData)

        } catch (err) {
            console.error('Error loading waiter data:', err)
        } finally {
            setLoading(false)
        }
    }, []) // Now it's stable and won't trigger re-renders of effects

    // Initial Fetch
    useEffect(() => {
        if (status === 'authenticated') {
            fetchData()
        }
    }, [status, fetchData])

    // Real-time updates with Ably
    useEffect(() => {
        if (status === 'authenticated' && session?.user && (session.user as any).organizationId) {
            const orgId = (session.user as any).organizationId
            const ably = new Ably.Realtime({ authUrl: '/api/ably/auth' })
            const channel = ably.channels.get(`orders:${orgId}`)

            channel.subscribe('order-update', fetchData)
            channel.subscribe('order-created', fetchData)

            return () => {
                channel.unsubscribe()
                ably.connection.off()
                ably.close()
            }
        }
    }, [status, session, fetchData])

    return {
        tables,
        categories,
        menuItems,
        activeOrders,
        loading,
        fetchData,
        setTables, // Exported if needed for optimistic updates
        setActiveOrders, // Exported if needed
        status // Exported to handle auth redirects in the component
    }
}
