import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/contact.module.css';

const ContactHero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A] z-0" />

            {/* Abstract Wave - CSS Implementation or SVG */}
            <div className="absolute inset-0 opacity-20 z-0">
                <svg className="w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="none">
                    <path
                        fill="none"
                        stroke="#00A1DE"
                        strokeWidth="2"
                        d="M0,300 C240,400 480,200 720,300 C960,400 1200,200 1440,300"
                        className="animate-pulse"
                    />
                    <path
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="1"
                        d="M0,350 C240,450 480,250 720,350 C960,450 1200,250 1440,350"
                        className="animate-pulse delay-75"
                    />
                </svg>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold mb-6 text-white uppercase tracking-widest font-['Clash_Grotesk']"
                >
                    {t('contact.hero.title')}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl font-light text-gray-300 max-w-2xl mx-auto"
                >
                    {t('contact.hero.subtitle')}
                </motion.p>
            </div>
        </section>
    );
};

export default ContactHero;
