'use client'

import { useState, FormEvent } from 'react'
import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { Container } from '@/components/ui/container'
import { useLanguage } from '@/components/providers/language-provider'
import { Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
    const { t } = useLanguage()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'contact',
                    to: 'support@hamelinfoods.com',
                    data: formData
                })
            })

            if (response.ok) {
                setIsSubmitting(false)
                setIsSuccess(true)

                // Reset form after 3 seconds
                setTimeout(() => {
                    setFormData({ name: '', email: '', subject: '', message: '' })
                    setIsSuccess(false)
                }, 3000)
            } else {
                throw new Error('Failed to send email')
            }
        } catch (error) {
            console.error('Error sending contact form:', error)
            setIsSubmitting(false)
            alert('Error al enviar el mensaje. Por favor intenta nuevamente.')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <section className="py-12 sm:py-20">
                <Container>
                    <div className="max-w-5xl mx-auto px-4">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
                                {t('contact.title')}
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                {t('contact.subtitle')}
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
                                    {isSuccess ? (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                {t('contact.form.success')}
                                            </h3>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Name */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                                    {t('contact.form.name')}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder={t('contact.form.namePlaceholder')}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                                    {t('contact.form.email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder={t('contact.form.emailPlaceholder')}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                />
                                            </div>

                                            {/* Subject */}
                                            <div>
                                                <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                                    {t('contact.form.subject')}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder={t('contact.form.subjectPlaceholder')}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                />
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                                    {t('contact.form.message')}
                                                </label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows={6}
                                                    placeholder={t('contact.form.messagePlaceholder')}
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        {t('contact.form.submitting')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={20} />
                                                        {t('contact.form.submit')}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                        {t('contact.info.title')}
                                    </h3>

                                    {/* Email */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <Mail className="text-orange-600 dark:text-orange-500" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                {t('contact.info.email')}
                                            </h4>
                                            <a
                                                href="mailto:support@hamelinfoods.com"
                                                className="text-orange-600 dark:text-orange-500 hover:underline"
                                            >
                                                support@hamelinfoods.com
                                            </a>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <Clock className="text-orange-600 dark:text-orange-500" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                {t('contact.info.hours')}
                                            </h4>
                                            <p className="text-slate-600 dark:text-slate-300">
                                                {t('contact.info.hoursValue')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <PublicFooter />
        </div>
    )
}
