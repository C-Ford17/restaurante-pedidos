'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { Loader2, UserCircle, Save, Lock } from 'lucide-react'

interface UserData {
    id: string
    name: string
    username: string
}

export default function AccountPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)

    // Profile state
    const [profileData, setProfileData] = useState({
        name: '',
        username: ''
    })
    const [profileSuccess, setProfileSuccess] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user/profile')
            if (response.ok) {
                const userData: UserData = await response.json()
                setProfileData({
                    name: userData.name || '',
                    username: userData.username || ''
                })
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setProfileError(null)
        setProfileSuccess(false)

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileData.name,
                    username: profileData.username
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error')
            }

            setProfileSuccess(true)
            setTimeout(() => setProfileSuccess(false), 3000)
        } catch (error) {
            console.error('Error updating profile:', error)
            setProfileError(error instanceof Error ? error.message : t('settings.account.profileError'))
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingPassword(true)
        setPasswordError(null)
        setPasswordSuccess(false)

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError(t('settings.account.passwordMismatch'))
            setSavingPassword(false)
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError(t('settings.account.passwordWeak'))
            setSavingPassword(false)
            return
        }

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error')
            }

            setPasswordSuccess(true)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (error) {
            console.error('Error updating password:', error)
            setPasswordError(error instanceof Error ? error.message : t('settings.account.passwordError'))
        } finally {
            setSavingPassword(false)
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
                    <UserCircle className="text-orange-600 dark:text-orange-400" size={24} />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {t('settings.account.title')}
                    </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('settings.account.subtitle')}
                </p>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('settings.account.profile')}
                </h3>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.account.name')}
                        </label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.account.username')}
                        </label>
                        <input
                            type="text"
                            value={profileData.username}
                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Success/Error Messages */}
                    {profileSuccess && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                {t('settings.account.profileSuccess')}
                            </p>
                        </div>
                    )}

                    {profileError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {profileError}
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
                                {t('settings.account.updateProfile')}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Password Form */}
            <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Lock className="text-orange-600 dark:text-orange-400" size={20} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('settings.account.changePassword')}
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.account.currentPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.account.newPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('settings.account.confirmPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Success/Error Messages */}
                    {passwordSuccess && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                {t('settings.account.passwordSuccess')}
                            </p>
                        </div>
                    )}

                    {passwordError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                {passwordError}
                            </p>
                        </div>
                    )}

                    {/* Update Button */}
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full sm:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingPassword ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                {t('modal.processing')}
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                {t('settings.account.updatePassword')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
