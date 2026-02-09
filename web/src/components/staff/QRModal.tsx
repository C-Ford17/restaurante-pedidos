'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface QRModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    url: string
    subtitle?: string
}

export default function QRModal({ isOpen, onClose, title, url, subtitle }: QRModalProps) {
    const { t } = useLanguage()
    const qrRef = useRef<HTMLDivElement>(null)

    if (!isOpen) return null


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center space-y-6">
                    {subtitle && (
                        <p className="text-center text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    <div ref={qrRef} className="p-4 bg-white rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center animate-in zoom-in duration-700 delay-200">
                        <QRCodeSVG
                            value={url}
                            size={256}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo.png", // Fallback if logo exists
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-xl break-all text-center">
                        <code className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {url}
                        </code>
                    </div>


                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all"
                    >
                        <ExternalLink size={20} />
                        {t('staff.tables.go_to_page')}
                    </a>
                </div>
            </div>
        </div>
    )
}
