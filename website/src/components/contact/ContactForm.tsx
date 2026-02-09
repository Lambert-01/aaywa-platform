import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/contact.module.css';

const ContactForm: React.FC = () => {
    const { t } = useTranslation();
    const [formState, setFormState] = useState({
        name: '',
        organization: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-[#FFD700] rounded-xl p-12 text-center max-w-2xl mx-auto my-20"
            >
                <div className="text-6xl mb-6">✨</div>
                <h3 className="text-3xl font-bold text-white mb-4 font-['Clash_Grotesk']">{t('contact.form.success.title')}</h3>
                <p className="text-gray-300">
                    {t('contact.form.success.message')}
                </p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 text-[#FFD700] hover:text-white underline"
                >
                    {t('contact.form.success.another')}
                </button>
            </motion.div>
        );
    }

    return (
        <section className="py-24 bg-[#0A0A0A]">
            <div className="container mx-auto px-6 max-w-5xl">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        <div className="inputGroup">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="inputField"
                                placeholder=" "
                                required
                                value={formState.name}
                                onChange={handleChange}
                            />
                            <label htmlFor="name" className="inputLabel">{t('contact.form.name')}</label>
                        </div>
                        <div className="inputGroup">
                            <input
                                type="text"
                                name="organization"
                                id="organization"
                                className="inputField"
                                placeholder=" "
                                value={formState.organization}
                                onChange={handleChange}
                            />
                            <label htmlFor="organization" className="inputLabel">{t('contact.form.organization')}</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        <div className="inputGroup">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="inputField"
                                placeholder=" "
                                required
                                value={formState.email}
                                onChange={handleChange}
                            />
                            <label htmlFor="email" className="inputLabel">{t('contact.form.email')}</label>
                        </div>
                        <div className="inputGroup">
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                className="inputField"
                                placeholder=" "
                                value={formState.phone}
                                onChange={handleChange}
                            />
                            <label htmlFor="phone" className="inputLabel">{t('contact.form.phone')}</label>
                        </div>
                    </div>

                    <div className="inputGroup">
                        <select
                            name="subject"
                            id="subject"
                            className="inputField bg-[#0A0A0A]" // Fix background for select
                            required
                            value={formState.subject}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden></option>
                            <option value="General Inquiry">{t('contact.form.subject.general')}</option>
                            <option value="Buy Produce">{t('contact.form.subject.buy')}</option>
                            <option value="Partnership">{t('contact.form.subject.partnership')}</option>
                            <option value="Other">{t('contact.form.subject.other')}</option>
                        </select>
                        <label htmlFor="subject" className="inputLabel">{t('contact.form.subject.label')}</label>
                    </div>

                    <div className="inputGroup">
                        <textarea
                            name="message"
                            id="message"
                            rows={4}
                            className="inputField resize-none"
                            placeholder=" "
                            required
                            value={formState.message}
                            onChange={handleChange}
                        />
                        <label htmlFor="message" className="inputLabel">{t('contact.form.message')}</label>
                    </div>

                    <div className="text-center pt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#FFD700] text-black px-12 py-4 rounded font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_4px_20px_rgba(255,215,0,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
