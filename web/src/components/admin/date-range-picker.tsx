'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface DateRangePickerProps {
    startDate: string
    endDate: string
    onChange: (start: string, end: string) => void
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const { t } = useLanguage()

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="hidden sm:flex items-center gap-2 px-2 text-slate-500">
                <CalendarIcon size={16} />
            </div>

            <input
                type="date"
                value={startDate}
                onChange={(e) => onChange(e.target.value, endDate)}
                className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
            />

            <span className="text-slate-400">-</span>

            <input
                type="date"
                value={endDate}
                onChange={(e) => onChange(startDate, e.target.value)}
                className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
            />

            {(startDate || endDate) && (
                <button
                    onClick={() => onChange('', '')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={t('admin.clear') || 'Clear'}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}
