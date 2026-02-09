import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/home.module.css';

const StorySection: React.FC = () => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (videoRef.current) {
                        videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
                    }
                }
            },
            { threshold: 0.4 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32"
            style={{ background: '#0A0A0A' }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                    {/* Video - 60% */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div
                            className="relative rounded overflow-hidden"
                            style={{
                                border: '1px solid #FFD700',
                                boxShadow: '0 10px 40px rgba(255, 215, 0, 0.1)',
                            }}
                        >
                            <video
                                ref={videoRef}
                                className="w-full h-auto"
                                controls
                                poster="/images/story-poster.jpg"
                                preload="metadata"
                            >
                                <source src="/videos/marie-story.mp4" type="video/mp4" />
                                <source src="/videos/marie-story.webm" type="video/webm" />
                                Your browser does not support the video tag.
                            </video>

                            {/* Fallback image if video unavailable */}
                            <div
                                className="absolute inset-0 bg-cover bg-center -z-10"
                                style={{
                                    backgroundImage: 'url(/images/story-fallback.jpg)',
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Text - 40% */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    >
                        <div className="relative">
                            {/* Quote */}
                            <blockquote className="mb-8">
                                <p
                                    className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                                    style={{
                                        fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                                        color: '#FFFFFF',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {t('home.story.quote')}
                                </p>
                                <footer className="flex items-center gap-4">
                                    <div
                                        className="h-1 w-12"
                                        style={{ background: '#FFD700' }}
                                    />
                                    <cite
                                        className="text-lg not-italic"
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontWeight: 300,
                                            color: 'rgba(255, 255, 255, 0.7)',
                                        }}
                                    >
                                        {t('home.story.author')}
                                    </cite>
                                </footer>
                            </blockquote>

                            {/* CTA Link */}
                            <a
                                href="#watch-story"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (videoRef.current) {
                                        videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        videoRef.current.play();
                                    }
                                }}
                                className="inline-flex items-center gap-3 group"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#FFFFFF',
                                    textDecoration: 'none',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                <span className="relative">
                                    {t('home.story.watch')}
                                    <span
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"
                                        style={{ background: '#FFD700' }}
                                    />
                                </span>
                                <svg
                                    className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2"
                                    fill="none"
                                    stroke="#FFD700"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StorySection;
