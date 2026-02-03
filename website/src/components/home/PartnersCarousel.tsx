import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../../styles/home.module.css';

interface Partner {
    name: string;
    logo: string; // Path to logo image or inline SVG
}

const PartnersCarousel: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    const partners: Partner[] = [
        { name: 'Afro Source', logo: '🍃' }, // Placeholder emoji - replace with actual logo
        { name: 'MTN Rwanda', logo: '📱' },
        { name: 'AAYWA & PARTNERS', logo: '🌱' },
        { name: 'Sanza Alkebulan', logo: '🌍' },
    ];

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

    // Auto-scroll carousel
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % partners.length);
            }, 3000); // 3 second cycle

            return () => clearInterval(interval);
        }
    }, [isPaused, partners.length]);

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32"
            style={{
                background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    style={{
                        fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                        color: 'rgba(255, 255, 255, 0.7)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}
                >
                    Trusted Partners
                </motion.h2>

                <motion.div
                    className="relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Carousel Container */}
                    <div className="flex items-center justify-center gap-8 md:gap-16">
                        {partners.map((partner, index) => {
                            const isActive = index === activeIndex;
                            const distance = Math.abs(index - activeIndex);

                            return (
                                <motion.div
                                    key={partner.name}
                                    className="flex flex-col items-center justify-center cursor-pointer transition-all duration-500"
                                    style={{
                                        transform: isActive ? 'scale(1.2)' : 'scale(0.8)',
                                        opacity: distance === 0 ? 1 : distance === 1 ? 0.5 : 0.3,
                                        filter: isActive
                                            ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))'
                                            : 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.1))',
                                    }}
                                    onClick={() => setActiveIndex(index)}
                                    whileHover={{ scale: isActive ? 1.25 : 0.9 }}
                                >
                                    {/* Logo Container */}
                                    <div
                                        className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-lg mb-4 transition-all duration-300"
                                        style={{
                                            background: isActive
                                                ? 'rgba(255, 255, 255, 0.1)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                            border: isActive
                                                ? '2px solid #FFD700'
                                                : '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                    >
                                        {/* Placeholder - Replace with actual logo/image */}
                                        <span className="text-6xl">{partner.logo}</span>
                                    </div>

                                    {/* Partner Name */}
                                    {isActive && (
                                        <motion.p
                                            className="text-sm md:text-base font-medium"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                fontFamily: "'Inter', sans-serif",
                                                color: '#FFD700',
                                                letterSpacing: '1px',
                                            }}
                                        >
                                            {partner.name}
                                        </motion.p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {partners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    background: index === activeIndex ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                                    width: index === activeIndex ? '24px' : '8px',
                                }}
                            />
                        ))}
                    </div>
                </motion.div>

                <motion.p
                    className="text-center mt-8 text-sm"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontWeight: 300,
                    }}
                >
                    Hover to pause • Click to navigate
                </motion.p>
            </div>
        </section>
    );
};

export default PartnersCarousel;
