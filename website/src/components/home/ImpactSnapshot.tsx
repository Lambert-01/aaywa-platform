import React, { useEffect, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/home.module.css';

interface ImpactCard {
    icon: React.ReactNode;
    value: string;
    description: string;
}

const ImpactSnapshot: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const cards: ImpactCard[] = [
        {
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="#00A1DE" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            ),
            value: '100',
            description: t('home.impact.empowered'),
        },
        {
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="#00A1DE" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
            ),
            value: '30%',
            description: t('home.impact.yield'),
        },
        {
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="#00A1DE" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
            ),
            value: '50/50',
            description: t('home.impact.profit'),
        },
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32"
            style={{ background: '#0A0A0A' }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? 'visible' : 'hidden'}
                >
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            className="group relative"
                        >
                            <div
                                className="bg-black border border-gray-800 rounded-lg p-8 text-center transition-all duration-300 hover:-translate-y-2"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    backdropFilter: 'blur(10px)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FFD700';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgb(31, 41, 55)';
                                }}
                            >
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    {card.icon}
                                </div>

                                {/* Value */}
                                <h3
                                    className="text-6xl md:text-7xl font-bold mb-4"
                                    style={{
                                        fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                                        color: '#FFD700',
                                        textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                                    }}
                                >
                                    {card.value}
                                </h3>

                                {/* Description */}
                                <p
                                    className="text-base md:text-lg"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 300,
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {card.description}
                                </p>

                                {/* Hover pulse border */}
                                <div
                                    className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        border: '2px solid #FFD700',
                                        animation: 'pulse 2s infinite',
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ImpactSnapshot;
