import React, { useEffect, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/home.module.css';

const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        }
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onLoadedData={() => setIsVideoLoaded(true)}
                    poster="/images/hero-poster.jpg"
                >
                    {/* Fallback to image if video not available */}
                    <source src="/videos/hero-background.mp4" type="video/mp4" />
                    <source src="/videos/hero-background.webm" type="video/webm" />
                </video>

                {/* Fallback background image */}
                {!isVideoLoaded && (
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.9)), url(/images/hero-fallback.jpg)',
                        }}
                    />
                )}

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        background: 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.9) 100%)',
                    }}
                />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
                    style={{
                        fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
                    }}
                >
                    {t('home.hero.title')}
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-2xl"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        letterSpacing: '1px',
                        color: 'rgba(255,255,255,0.9)',
                    }}
                >
                    {t('home.hero.subtitle')}
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <Link to="/model">
                        <button
                            className="px-12 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-300"
                            style={{
                                background: '#E6C200',
                                color: '#0A0A0A',
                                border: 'none',
                                letterSpacing: '1.5px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {t('home.hero.explore')}
                        </button>
                    </Link>

                    <Link to="/buy">
                        <button
                            className="px-12 py-4 text-base font-bold uppercase tracking-wider rounded transition-all duration-300"
                            style={{
                                background: 'transparent',
                                color: '#FFFFFF',
                                border: '2px solid #FFFFFF',
                                letterSpacing: '1.5px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = '#E6C200';
                                e.currentTarget.style.color = '#E6C200';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = '#FFFFFF';
                                e.currentTarget.style.color = '#FFFFFF';
                            }}
                        >
                            {t('home.hero.buy')}
                        </button>
                    </Link>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-12"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 1.5,
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                >
                    <svg
                        className="w-8 h-8 text-white opacity-60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
