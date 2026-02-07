'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { PhoneInput } from '@/components/settings/phone-input'
import { Loader2, Building2, Save } from 'lucide-react'

interface OrganizationData {
    name: string
    nit: string
    phone: string
    phoneCountry: string
    email: string
}

export default function OrganizationPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState<OrganizationData>({
        name: '',
        nit: '',
        phone: '',
        phoneCountry: '+57',
        email: ''
    })
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchOrganizationData()
    }, [])

    const fetchOrganizationData = async () => {
        try {
            const response = await fetch('/api/organization')
            if (response.ok) {
                const orgData = await response.json()
                setData({
                    name: orgData.name || '',
                    nit: orgData.nit || '',
                    phone: orgData.phone || '',
                    phoneCountry: orgData.phoneCountry || '+57',
                    email: orgData.email || ''
                })
            }
        } catch (error) {
            console.error('Error fetching organization:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch('/api/organization/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nit: data.nit,
                    phone: data.phone,
                    phoneCountry: data.phoneCountry,
                    email: data.email
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error')
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Error updating organization:', error)
            setError(error instanceof Error ? error.message : t('settings.organization.error'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="text-orange-600 dark:text-orange-400" size={24} />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('settings.organization.title')}
                    </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('settings.organization.subtitle')}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                    {/* Organization Name (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.organization.title')}
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            disabled
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white cursor-not-allowed opacity-75"
                        />
                    </div>

                    {/* NIT */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.organization.nit')}
                        </label>
                        <input
                            type="text"
                            value={data.nit}
                            onChange={(e) => setData({ ...data, nit: e.target.value })}
                            placeholder={t('settings.organization.nitPlaceholder')}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.organization.phone')}
                        </label>
                        <PhoneInput
                            value={data.phone}
                            countryCode={data.phoneCountry}
                            onValueChange={(value) => setData({ ...data, phone: value })}
                            onCountryCodeChange={(code) => setData({ ...data, phoneCountry: code })}
                            placeholder={t('settings.organization.phonePlaceholder')}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.organization.email')}
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            placeholder={t('settings.organization.emailPlaceholder')}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                {t('settings.organization.success')}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                {t('modal.processing')}
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {t('settings.organization.save')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
