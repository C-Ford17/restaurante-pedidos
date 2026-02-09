'use client'

import { useEffect, useState } from 'react'
import { UsageIndicator } from '@/components/settings/usage-indicator'
import { UpgradeBanner } from '@/components/settings/upgrade-banner'
import { AddUserModal } from '@/components/settings/add-user-modal'
import { PlanUpgradeModal } from '@/components/settings/plan-upgrade-modal'
import { DeleteUserModal } from '@/components/settings/delete-user-modal'
import { Loader2, Users as UsersIcon, Mail, Shield, Trash2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface User {
    id: string
    name: string
    username: string
    role: string
    createdAt: string
}

interface UsageLimits {
    users: {
        current: number
        max: number
        percentage: number
        canAdd: boolean
        isUnlimited: boolean
    }
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [limits, setLimits] = useState<UsageLimits | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [limitsRes, usersRes] = await Promise.all([
                fetch('/api/organization/limits'),
                fetch('/api/users')
            ])

            const limitsData = await limitsRes.json()
            setLimits(limitsData)

            if (usersRes.ok) {
                const usersData = await usersRes.json()
                setUsers(usersData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteSuccess = () => {
        fetchData()
        setUserToDelete(null)
    }

    const { t } = useLanguage()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    const showWarning = limits && limits.users.percentage >= 80 && !limits.users.isUnlimited
    const atLimit = limits ? !limits.users.canAdd : false

    return (
        <div className="space-y-6">
            {/* Header with Usage */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {t('settings.users.title')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('settings.users.subtitle')}
                        </p>
                    </div>
                </div>

                {limits && (
                    <UsageIndicator
                        current={limits.users.current}
                        max={limits.users.max}
                        label="Usuarios"
                        type="users"
                        isUnlimited={limits.users.isUnlimited}
                    />
                )}
            </div>

            {/* Warnings */}
            {(showWarning || atLimit) && (
                <UpgradeBanner
                    type={atLimit ? 'limit-reached' : 'warning'}
                    resourceType="usuarios"
                    onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                />
            )}

            {/* Users List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {t('settings.users.current')}
                    </h3>
                    <button
                        disabled={atLimit}
                        onClick={() => setIsModalOpen(true)}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${atLimit
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                            }`}
                    >
                        <span className="hidden sm:inline">{t('settings.users.add')}</span>
                        <span className="sm:hidden">Agregar</span>
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <UsersIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400">
                            {t('settings.users.empty')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                        <UsersIcon className="text-orange-600 dark:text-orange-400" size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                                <Mail size={12} className="flex-shrink-0" />
                                                <span className="truncate">{user.username}</span>
                                            </span>
                                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Shield size={12} className="flex-shrink-0" />
                                                <span className="capitalize">{t('role.' + user.role) || user.role}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(user)}
                                    disabled={user.role === 'admin'}
                                    className="ml-2 sm:ml-4 p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    title={user.role === 'admin' ? 'No se puede eliminar admin' : 'Eliminar usuario'}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />

            {/* Delete User Modal */}
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setUserToDelete(null)
                }}
                onSuccess={handleDeleteSuccess}
                user={userToDelete}
            />

            {/* Plan Upgrade Modal */}
            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSuccess={fetchData}
                currentPlan="Básico"
            />
        </div>
    )
}
