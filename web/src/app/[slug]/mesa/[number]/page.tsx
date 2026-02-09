'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function CustomerWelcomePage() {
    const { t } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [orgInfo, setOrgInfo] = useState<{ name: string } | null>(null)

    const slug = params.slug as string
    const tableNumber = params.number as string

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await fetch(`/api/organization?slug=${slug}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrgInfo(data)
                }
            } catch (error) {
                console.error('Error fetching org:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrg()
    }, [slug])

    const startOrder = () => {
        router.push(`/${slug}/mesa/${tableNumber}/menu`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-600">
                <Loader2 className="animate-spin text-white" size={48} />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <UtensilsCrossed size={48} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {orgInfo?.name ? `${t('customer.welcome')} ${orgInfo.name}` : t('customer.welcome')}
                        </h1>
                        <p className="text-xl opacity-90 font-medium mt-2">
                            {t('common.table')} {tableNumber}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-lg opacity-80 leading-relaxed">
                        {t('customer.start_instruction')}
                    </p>
                    <button
                        onClick={startOrder}
                        className="w-full py-4 bg-white text-orange-600 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {t('customer.start_button')}
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}
