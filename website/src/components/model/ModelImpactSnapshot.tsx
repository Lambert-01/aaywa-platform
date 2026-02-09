import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/model.module.css';

interface StatProps {
    value: number;
    suffix?: string;
    label: string;
}

const AnimatedStat: React.FC<StatProps> = ({ value, suffix = '', label }) => {
    const spring = useSpring(0, { stiffness: 50, damping: 20 });
    const display = useTransform(spring, (current) =>
        Math.floor(current).toLocaleString() + suffix
    );

    useEffect(() => {
        // Simple intersection observer logic can be handled by parent or just trigger on mount
        // For simplicity in this demo, we'll animate on mount/view
        const timeout = setTimeout(() => spring.set(value), 500);
        return () => clearTimeout(timeout);
    }, [spring, value]);

    return (
        <div className="text-center p-6 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
            <motion.div
                className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-2 font-['Clash_Grotesk']"
            >
                {display}
            </motion.div>
            <p className="text-white/80 font-light uppercase tracking-widest text-sm">
                {label}
            </p>
        </div>
    );
};

const ModelImpactSnapshot: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-gradient-to-b from-[#0A0A0A] to-[#111111] relative border-y border-white/5">
            <div className="container mx-auto px-6">
                <h2 className="sr-only">Impact Statistics</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatedStat value={100} label={t('model_page.impact.women_empowered')} />
                    <AnimatedStat value={30} suffix="%" label={t('model_page.impact.yield_increase')} />
                    <AnimatedStat value={92} suffix="%" label={t('model_page.impact.repayment_rate')} />
                    <AnimatedStat value={4} label={t('model_page.impact.vslas')} />
                </div>

                <div className="mt-12 text-center">
                    <p className="text-2xl text-white font-['Clash_Grotesk']">
                        {t('model_page.impact.total_income')}: <span className="text-[#00A1DE]">RWF 4.2M</span>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ModelImpactSnapshot;
