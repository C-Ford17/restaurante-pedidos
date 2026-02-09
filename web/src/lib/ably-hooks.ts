import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Ably from 'ably'

export const useAbly = (eventName: string, callback: (message: any) => void) => {
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'authenticated' && session?.user && (session.user as any).organizationId) {
            const orgId = (session.user as any).organizationId

            // In a real app, we might want to share the connection instance
            // but for now, creating a new one per component is acceptable if not overused
            // or we could use an AblyProvider context.
            // Given the current architecture, we'll keep it simple as in WaiterPage.

            const ably = new Ably.Realtime({ authUrl: '/api/ably/auth' })
            const channel = ably.channels.get(`orders:${orgId}`)

            channel.subscribe(eventName, (message) => {
                callback(message.data)
            })

            return () => {
                channel.unsubscribe()
                ably.connection.off()
                ably.close()
            }
        }
    }, [status, session, eventName, callback])
}
