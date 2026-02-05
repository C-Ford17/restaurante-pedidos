'use client'

import { AlertTriangle, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradeBannerProps {
    type: 'warning' | 'limit-reached'
    resourceType: 'mesas' | 'usuarios'
    currentPlan?: string
}

export function UpgradeBanner({ type, resourceType, currentPlan = 'Básico' }: UpgradeBannerProps) {
    const isLimitReached = type === 'limit-reached'

    return (
        <div className={`rounded-lg border p-4 ${isLimitReached
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className={`shrink-0 mt-0.5 ${isLimitReached
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`} size={20} />

                <div className="flex-1 space-y-2">
                    <h3 className={`font-semibold ${isLimitReached
                            ? 'text-red-900 dark:text-red-100'
                            : 'text-yellow-900 dark:text-yellow-100'
                        }`}>
                        {isLimitReached
                            ? `Has alcanzado el límite de ${resourceType}`
                            : `Cerca del límite de ${resourceType}`
                        }
                    </h3>

                    <p className={`text-sm ${isLimitReached
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                        {isLimitReached
                            ? `Tu plan ${currentPlan} no permite agregar más ${resourceType}. Actualiza tu plan para continuar.`
                            : `Estás cerca de alcanzar el límite de ${resourceType} de tu plan ${currentPlan}. Considera actualizar para evitar interrupciones.`
                        }
                    </p>

                    <Link
                        href="/pricing"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isLimitReached
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            }`}
                    >
                        <Sparkles size={16} />
                        Actualizar Plan
                    </Link>
                </div>
            </div>
        </div>
    )
}
