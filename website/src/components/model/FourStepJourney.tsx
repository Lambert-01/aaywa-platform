import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/model.module.css';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: string;
}

const FourStepJourney: React.FC = () => {
    const { t } = useTranslation();

    const steps: Step[] = [
        {
            id: 1,
            title: t('model_page.journey.step1.title'),
            description: t('model_page.journey.step1.desc'),
            icon: '🌱'
        },
        {
            id: 2,
            title: t('model_page.journey.step2.title'),
            description: t('model_page.journey.step2.desc'),
            icon: '👩‍🌾'
        },
        {
            id: 3,
            title: t('model_page.journey.step3.title'),
            description: t('model_page.journey.step3.desc'),
            icon: '💰'
        },
        {
            id: 4,
            title: t('model_page.journey.step4.title'),
            description: t('model_page.journey.step4.desc'),
            icon: '🤝'
        }
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.2 }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <h2 className="text-4xl font-bold text-white text-center mb-16 uppercase tracking-wider font-['Clash_Grotesk']">
                        {t('model_page.journey.title')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-800 -z-10" />

                        {steps.map((step) => (
                            <motion.div
                                key={step.id}
                                variants={cardVariants}
                                className="group featureCard p-8 rounded-xl relative hover:bg-white/5 transition-all duration-300"
                            >
                                <div className="w-24 h-24 bg-[#0A0A0A] border-2 border-[#FFD700] rounded-full flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 relative z-10">
                                    {step.icon}
                                </div>

                                <h3 className="text-xl font-bold text-[#FFD700] mb-4 text-center uppercase tracking-wide">
                                    {step.id}. {step.title}
                                </h3>

                                <p className="text-gray-300 text-center font-light leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FourStepJourney;
