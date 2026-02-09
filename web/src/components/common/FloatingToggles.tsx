'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/providers/language-provider'
import { Moon, Sun, Languages, Settings2, X, ChevronRight, Globe } from 'lucide-react'

export const FloatingToggles = () => {
    const { theme, setTheme } = useTheme()
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [showGooglePicker, setShowGooglePicker] = useState(false)

    // Position state for draggability
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const toggleLanguage = () => {
        const nextLang = language === 'es' ? 'en' : 'es'
        setLanguage(nextLang)
        triggerGoogleTranslate(nextLang)
    }

    const triggerGoogleTranslate = (targetLang: string, retryCount = 0) => {
        if (retryCount > 10) {
            console.warn('Google Translate combo not found after 10 attempts, stopping.')
            return
        }

        console.log('Triggering Google Translate to:', targetLang)
        const element = document.querySelector('.goog-te-combo') as HTMLSelectElement

        if (element) {
            console.log('Found Google Translate combo, switching language...')
            element.value = targetLang
            element.dispatchEvent(new Event('change'))
        } else {
            // Only warn on first few attempts to reduce noise
            if (retryCount < 3) {
                console.warn(`Google Translate combo not found (attempt ${retryCount + 1}), retrying...`)
            }
            setTimeout(() => triggerGoogleTranslate(targetLang, retryCount + 1), 500)
        }
    }

    // Auto-hide and Snap logic
    useEffect(() => {
        if (isDragging || isOpen || isMinimized) return

        const timer = setTimeout(() => {
            setIsMinimized(true)
        }, 3000)

        return () => clearTimeout(timer)
    }, [isDragging, isOpen, isMinimized, position])

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isOpen && (e.target as HTMLElement).closest('.sub-button')) return

        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

        dragRef.current = {
            startX: clientX,
            startY: clientY,
            startPosX: position.x,
            startPosY: position.y
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !dragRef.current) return

            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY

            const deltaX = clientX - dragRef.current.startX
            const deltaY = clientY - dragRef.current.startY

            setPosition({
                x: dragRef.current.startPosX + deltaX,
                y: dragRef.current.startPosY + deltaY
            })
        }

        const handleMouseUp = () => {
            if (!isDragging) return
            setIsDragging(false)
            dragRef.current = null

            // Snap to nearest horizontal edge
            const screenWidth = window.innerWidth
            const buttonWidth = 60 // approx
            const currentX = position.x
            // Calculate absolute position considering initial 'right-6' (approx 24px)
            // Initial X is 0 relative to right: 24px.
            // If X is -100, it's 124px from right.

            // Simplification: We tracking delta. Let's just reset X to 0 (right edge) or move to left edge.
            // Since it's 'right: 6', X=0 is right side.
            // Left side would be X approx -(screenWidth - 80)

            const threshold = -(screenWidth / 2)

            if (currentX < threshold) {
                // Snap to Left
                // We want it to be same distance from left as it is from right
                // Initial position is right: 1.5rem (24px)
                // To have left: 1.5rem (24px), we need to move X by -(screenWidth - 48 - buttonWidth)
                // let's leave safe margin
                setPosition(prev => ({ ...prev, x: -(screenWidth - 85) }))
            } else {
                // Snap to Right
                setPosition(prev => ({ ...prev, x: 0 }))
            }
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchmove', handleMouseMove)
            window.addEventListener('touchend', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchmove', handleMouseMove)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging, position.x]) // Added position.x dep for snap calculation

    useEffect(() => {
        const initGoogle = () => {
            console.log('Initializing Google Translate...')
            if (!(window as any).google?.translate?.TranslateElement) {
                console.log('Google Translate not loaded yet, retrying...')
                setTimeout(initGoogle, 100)
                return
            }
            new (window as any).google.translate.TranslateElement({
                pageLanguage: 'es',
                includedLanguages: 'en,es,fr,pt,it,de',
                autoDisplay: false,
            }, 'google_translate_element')
            console.log('Google Translate initialized.')
            // If we are already in another language, trigger it
            if (language !== 'es') {
                console.log('Detected persistence of language:', language, 'triggering Google Translate')
                setTimeout(() => triggerGoogleTranslate(language), 1000)
            }
        }

        // Add Google Translate script
        const scriptId = 'google-translate-script'
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script')
            script.id = scriptId
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            script.async = true
            document.body.appendChild(script)
                ; (window as any).googleTranslateElementInit = initGoogle
        } else {
            // If script is already there, just try to init
            initGoogle()
        }
    }, [])

    if (isMinimized) {
        // Calculate side based on position.x
        // if x is close to 0, it's right side. If negative large, left side.
        const isRight = position.x > -100 // Threshold

        return (
            <button
                onClick={() => setIsMinimized(false)}
                style={{
                    transform: `translate(0px, ${position.y}px)`, // Reset X translation, let left/right handle it
                    borderRadius: isRight ? '0.75rem 0 0 0.75rem' : '0 0.75rem 0.75rem 0',
                    left: isRight ? 'auto' : '0', // Stick to edge
                    right: isRight ? '0' : 'auto'
                }}
                className={`fixed bottom-24 bg-orange-600 shadow-lg text-white p-2 z-50 transition-all duration-300 group cursor-pointer ${isRight ? 'pl-3 hover:pl-4' : 'pr-3 hover:pr-4'}`}
                title="Show Settings"
            >
                {isRight ? (
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                ) : (
                    <ChevronRight size={20} className="group-hover:-translate-x-1 transition-transform rotate-180" />
                )}
            </button>
        )
    }

    return (
        <div
            className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 touch-none pointer-events-none" // pointer-events-none on container
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // Springy snap
            }}
        >
            {/* Expanded Menu */}
            <div className={`flex flex-col items-end gap-3 mb-2 transition-all duration-300 origin-bottom sub-buttons-container pointer-events-auto ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none translate-y-4'
                }`}>
                <button
                    onClick={() => setShowGooglePicker(!showGooglePicker)}
                    className={`sub-button p-3 rounded-full shadow-lg border flex items-center gap-2 active:scale-95 transition-all group relative ${showGooglePicker
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                    title="Otras Lenguas (Google)"
                >
                    <Globe size={20} />
                    <span className="absolute right-full mr-3 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Otras Lenguas
                    </span>
                </button>

                <button
                    onClick={toggleLanguage}
                    className="sub-button bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    title="Toggle Language"
                >
                    <Languages size={20} />
                    <span className="text-xs font-bold w-6 text-center">{language.toUpperCase()}</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="sub-button bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                    onClick={() => {
                        setIsMinimized(true)
                        setIsOpen(false)
                    }}
                    className="sub-button bg-slate-100 dark:bg-slate-700 text-slate-500 p-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
                    title="Minimize Menu"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Toggle Button */}
            <button
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onClick={() => {
                    if (!isDragging) setIsOpen(!isOpen)
                }}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 active:scale-90 cursor-grab active:cursor-grabbing pointer-events-auto ${isOpen
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-105 shadow-orange-600/30'
                    }`}
            >
                <Settings2 size={24} className={`${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`} />
            </button>

            {/* Hidden Google Translate Element (but present in layout) */}
            <div
                id="google_translate_element"
                className={`fixed bottom-40 right-6 transition-all duration-300 z-[60] pointer-events-auto ${showGooglePicker ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none translate-y-4'
                    }`}
            />
        </div>
    )
}
