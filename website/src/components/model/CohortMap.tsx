import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/model.module.css';

interface Cohort {
    id: number;
    name: string;
    location: { top: string; left: string };
    farmers: number;
    crops: string[];
    image: string;
}

const CohortMap: React.FC = () => {
    const { t } = useTranslation();
    const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);

    const cohorts: Cohort[] = [
        {
            id: 1,
            name: 'Musanze Alpha',
            location: { top: '25%', left: '52%' },
            farmers: 25,
            crops: ['Avocado', 'Beans'],
            image: '/images/cohort-musanze.jpg'
        },
        {
            id: 2,
            name: 'Rubavu Beta',
            location: { top: '35%', left: '28%' },
            farmers: 25,
            crops: ['Macadamia', 'Maize'],
            image: '/images/cohort-rubavu.jpg'
        },
        {
            id: 3,
            name: 'Muhanga Gamma',
            location: { top: '60%', left: '50%' },
            farmers: 25,
            crops: ['Avocado', 'Vegetables'],
            image: '/images/cohort-muhanga.jpg'
        },
        {
            id: 4,
            name: 'Nyamasheke Delta',
            location: { top: '70%', left: '22%' },
            farmers: 25,
            crops: ['Macadamia', 'Beans'],
            image: '/images/cohort-nyamasheke.jpg'
        },
    ];

    return (
        <section className="py-24 bg-[#0A0A0A] relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Map Visualization */}
                    <div className="w-full lg:w-1/2 relative min-h-[400px]">
                        <h2 className="text-3xl font-bold text-white mb-8 font-['Clash_Grotesk'] lg:hidden">
                            {t('model_page.map.title_mobile')}
                        </h2>

                        {/* Simplified Rwanda Map SVG */}
                        <svg viewBox="0 0 200 220" className="w-full h-auto drop-shadow-[0_0_15px_rgba(0,161,222,0.3)]">
                            <path
                                d="M 50 20 Q 60 15, 70 20 L 90 25 Q 100 22, 110 25 L 130 30 Q 140 32, 145 40 L 150 60 Q 152 75, 155 85 L 158 100 Q 160 115, 158 130 L 155 150 Q 152 165, 148 175 L 140 190 Q 130 200, 120 205 L 100 210 Q 80 212, 70 208 L 50 200 Q 40 195, 35 185 L 25 165 Q 20 150, 22 135 L 25 110 Q 28 90, 32 75 L 38 55 Q 42 35, 50 20 Z"
                                fill="#111111"
                                stroke="#333333"
                                strokeWidth="1"
                            />
                        </svg>

                        {cohorts.map((cohort) => (
                            <motion.button
                                key={cohort.id}
                                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#00A1DE] border-2 border-white shadow-[0_0_20px_#00A1DE] hover:scale-125 transition-transform z-10"
                                style={{ top: cohort.location.top, left: cohort.location.left }}
                                whileHover={{ scale: 1.5 }}
                                onClick={() => setSelectedCohort(cohort)}
                            >
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded pointer-events-none">
                                    {cohort.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Info Panel / Modal */}
                    <div className="w-full lg:w-1/2">
                        <AnimatePresence mode="wait">
                            {selectedCohort ? (
                                <motion.div
                                    key={selectedCohort.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl"
                                >
                                    <h3 className="text-3xl font-bold text-white mb-2 font-['Clash_Grotesk']">
                                        {selectedCohort.name}
                                    </h3>
                                    <div className="h-1 w-20 bg-[#FFD700] mb-6" />

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">{t('model_page.map.farmers')}</p>
                                            <p className="text-2xl text-white font-bold">{selectedCohort.farmers}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">{t('model_page.map.crops')}</p>
                                            <div className="flex flex-wrap gap-2 text-white">
                                                {selectedCohort.crops.map(c => (
                                                    <span key={c} className="bg-[#00A1DE]/20 text-[#00A1DE] px-2 py-0.5 rounded text-sm border border-[#00A1DE]/30">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 font-light italic border-l-2 border-gray-700 pl-4">
                                        {t('model_page.map.quote')}
                                    </p>

                                    <button
                                        onClick={() => setSelectedCohort(null)}
                                        className="mt-8 text-sm text-gray-500 hover:text-white transition-colors"
                                    >
                                        ← {t('model_page.map.clear')}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center lg:text-left"
                                >
                                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-['Clash_Grotesk']">
                                        {t('model_page.map.title_desktop')}
                                    </h2>
                                    <p className="text-xl text-gray-400 font-light mb-8 max-w-md">
                                        {t('model_page.map.subtitle')}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-[#FFD700]">
                                        <span className="animate-pulse">●</span> {t('model_page.map.instruction')}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CohortMap;
