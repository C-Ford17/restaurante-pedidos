'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { ReactNode, useEffect, useState } from 'react'

export function LanguageWrapper({ children }: { children: ReactNode }) {
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Find all elements with data-translate attribute and translated them
        const elements = document.querySelectorAll('[data-translate]')
        elements.forEach(el => {
            const key = el.getAttribute('data-translate')
            if (key) {
                el.textContent = t(key)
            }
        })
    }, [t])

    if (!mounted) {
        return <>{children}</>
    }

    // We clone children to update text content if possible, or we just rely on the effect
    // But since this is a server component wrapper, we need a way to pass t() down or update DOM.
    // The effect above handles DOM updates for static content marked with data-translate.
    // For dynamic content, useLanguage should be used directly in client components.

    return <div key={Math.random()}>{children}</div>
}
