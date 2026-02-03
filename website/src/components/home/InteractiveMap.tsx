import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../../styles/home.module.css';

interface CohortLocation {
    id: number;
    name: string;
    x: number; // Percentage from left
    y: number; // Percentage from top
}

const InteractiveMap: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCohort, setHoveredCohort] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    const cohorts: CohortLocation[] = [
        { id: 1, name: 'Musanze', x: 52, y: 25 },
        { id: 2, name: 'Rubavu', x: 28, y: 35 },
        { id: 3, name: 'Muhanga', x: 50, y: 60 },
        { id: 4, name: 'Nyamasheke', x: 22, y: 70 },
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

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32"
            style={{ background: '#0A0A0A' }}
        >
            <div className="max-w-6xl mx-auto px-6 md:px-12">
                <motion.h2
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    style={{
                        fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                        color: '#FFFFFF',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}
                >
                    Growing Across Rwanda
                </motion.h2>

                <motion.div
                    className="relative max-w-2xl mx-auto"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Rwanda Map SVG - Simplified outline */}
                    <svg
                        viewBox="0 0 200 220"
                        className="w-full h-auto"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1"
                    >
                        {/* Simplified Rwanda outline */}
                        <path
                            d="M 50 20 Q 60 15, 70 20 L 90 25 Q 100 22, 110 25 L 130 30 Q 140 32, 145 40 L 150 60 Q 152 75, 155 85 L 158 100 Q 160 115, 158 130 L 155 150 Q 152 165, 148 175 L 140 190 Q 130 200, 120 205 L 100 210 Q 80 212, 70 208 L 50 200 Q 40 195, 35 185 L 25 165 Q 20 150, 22 135 L 25 110 Q 28 90, 32 75 L 38 55 Q 42 35, 50 20 Z"
                            fill="rgba(255, 255, 255, 0.05)"
                        />
                    </svg>

                    {/* Cohort Dots */}
                    {cohorts.map((cohort, index) => (
                        <motion.div
                            key={cohort.id}
                            className="absolute cursor-pointer"
                            style={{
                                left: `${cohort.x}%`,
                                top: `${cohort.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                            onMouseEnter={() => setHoveredCohort(cohort.id)}
                            onMouseLeave={() => setHoveredCohort(null)}
                            onClick={() => {
                                // Scroll to model section when clicked
                                window.location.href = '/model';
                            }}
                        >
                            {/* Glowing Dot */}
                            <div
                                className="relative w-4 h-4 rounded-full transition-all duration-300"
                                style={{
                                    background: '#00A1DE',
                                    boxShadow: hoveredCohort === cohort.id
                                        ? '0 0 25px #00A1DE, 0 0 35px #00A1DE'
                                        : '0 0 15px #00A1DE',
                                    animation: 'pulse 2s infinite',
                                    transform: hoveredCohort === cohort.id ? 'scale(1.5)' : 'scale(1)',
                                }}
                            >
                                {/* Pulse ring */}
                                <div
                                    className="absolute inset-0 rounded-full animate-ping"
                                    style={{
                                        background: '#00A1DE',
                                        opacity: 0.5,
                                    }}
                                />
                            </div>

                            {/* Label */}
                            {hoveredCohort === cohort.id && (
                                <motion.div
                                    className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                >
                                    <div
                                        className="px-3 py-1 rounded text-sm font-medium"
                                        style={{
                                            background: '#FFD700',
                                            color: '#0A0A0A',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {cohort.name}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    className="text-center mt-12 text-lg"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 1 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 300,
                    }}
                >
                    Click on a location to learn more about our cohorts
                </motion.p>
            </div>
        </section>
    );
};

export default InteractiveMap;
