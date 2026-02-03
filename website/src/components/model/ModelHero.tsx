import React from 'react';
import { motion, Variants } from 'framer-motion';
import '../../styles/model.module.css';

const ModelHero: React.FC = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' }
        }
    };

    return (
        <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
            {/* Background Pattern */}
            <div className="absolute inset-0 heroPattern opacity-30" />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white uppercase tracking-[3px]"
                        style={{ fontFamily: "'Clash Grotesk', 'Inter', sans-serif" }}
                    >
                        The AAYWA & PARTNERS Model
                    </motion.h1>

                    <motion.div
                        variants={itemVariants}
                        className="h-1 w-24 bg-[#FFD700] mx-auto mb-8"
                    />

                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl font-light text-gray-300 max-w-3xl mx-auto leading-relaxed"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        A scalable blueprint for regenerative, women-led agriculture that combines productivity, market access, and financial inclusion.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};

export default ModelHero;
