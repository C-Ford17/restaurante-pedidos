'use client'

import { XCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface LimitReachedProps {
    resourceType: 'mesa' | 'usuario'
    currentPlan?: string
}

export function LimitReached({ resourceType, currentPlan = 'Básico' }: LimitReachedProps) {
    const resourceLabel = resourceType === 'mesa' ? 'mesas' : 'usuarios'

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                <XCircle className="text-red-600 dark:text-red-400" size={48} />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Límite alcanzado
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    Has alcanzado el límite de {resourceLabel} de tu plan {currentPlan}.
                    Para agregar más {resourceLabel}, actualiza tu plan a uno superior.
                </p>
            </div>

            <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/20"
            >
                <Sparkles size={20} />
                Ver Planes
            </Link>
        </div>
    )
}
