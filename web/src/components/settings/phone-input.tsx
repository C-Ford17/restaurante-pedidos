'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface PhoneInputProps {
    value: string
    countryCode: string
    onValueChange: (value: string) => void
    onCountryCodeChange: (code: string) => void
    disabled?: boolean
    placeholder?: string
}

const COUNTRY_CODES = [
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+52', country: 'México', flag: '🇲🇽' },
    { code: '+34', country: 'España', flag: '🇪🇸' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+51', country: 'Perú', flag: '🇵🇪' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+55', country: 'Brasil', flag: '🇧🇷' },
]

export function PhoneInput({
    value,
    countryCode,
    onValueChange,
    onCountryCodeChange,
    disabled = false,
    placeholder = '300 123 4567'
}: PhoneInputProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

    return (
        <div className="relative">
            <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={disabled}
                        className="h-10 px-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.code}</span>
                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                {COUNTRY_CODES.map((country) => (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                            onCountryCodeChange(country.code)
                                            setIsDropdownOpen(false)
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${country.code === countryCode
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                            : 'text-slate-900 dark:text-white'
                                            }`}
                                    >
                                        <span className="text-lg">{country.flag}</span>
                                        <span className="text-sm font-medium">{country.code}</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{country.country}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Phone Number Input */}
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    )
}
