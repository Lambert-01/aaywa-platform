import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Placeholder Component for missing images
const PlaceholderImage: React.FC<{ name: string }> = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative overflow-hidden group-hover:bg-zinc-700 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
            <span className="text-zinc-600 font-bold text-4xl md:text-6xl tracking-widest group-hover:text-[#E6C200]/20 transition-colors duration-500 select-none">
                {initials}
            </span>
        </div>
    );
};

const AboutPage: React.FC = () => {
    const { t } = useTranslation();

    // Team Data Structure
    const boardMembers = [
        {
            name: "Bonnette Ishimwe",
            role: t('about.team.bonnette.role'),
            image: "/images/team/bonette-ishimwe.jpeg",
            bio: t('about.team.bonnette.bio')
        },
        {
            name: "Nicole Kalisa Umutoni",
            role: t('about.team.nicole.role'),
            image: "/images/team/kalisa.jpeg",
            bio: t('about.team.nicole.bio')
        },
        {
            name: "Rose Muhumuza",
            role: t('about.team.rose.role'),
            image: "/images/team/rose-muhumuza.jpeg",
            bio: t('about.team.rose.bio')
        },
        {
            name: "Solange Umutoni",
            role: t('about.team.solange.role'),
            image: "/images/team/solange-umutoni.jpeg",
            bio: t('about.team.solange.bio')
        }
    ];

    const boardAdvisors = [
        {
            name: "Nadia Niwemugeni",
            role: t('about.team.nadia.role'),
            image: null,
            bio: t('about.team.nadia.bio')
        },
        {
            name: "Ingabe Kalisa Gashayija",
            role: t('about.team.ingabe.role'),
            image: null,
            bio: t('about.team.ingabe.bio')
        }
    ];

    const effectiveMembers = [
        {
            name: "Colombe Rukwaya",
            role: t('about.team.colombe.role'),
            image: null,
            bio: t('about.team.colombe.bio')
        },
        {
            name: "Bénie Ange IRADUKUNDA",
            role: t('about.team.benie.role'),
            image: "/images/team/ange-iradukunda.jpeg",
            bio: t('about.team.benie.bio')
        },
        {
            name: "Hyacintha Tuyisenge",
            role: t('about.team.hyacintha.role'),
            image: "/images/team/tuyisenge-hyacenta.jpeg",
            bio: t('about.team.hyacintha.bio')
        },
        {
            name: "Shilla Ndegeya",
            role: t('about.team.shilla.role'),
            image: "/images/team/shilla-ndegeya.jpeg",
            bio: t('about.team.shilla.bio')
        },
        {
            name: "Concilie Uwitonze",
            role: t('about.team.concilie.role'),
            image: "/images/team/concilie.jpeg",
            bio: t('about.team.concilie.bio')
        },
        {
            name: "Faith Muhoza",
            role: t('about.team.faith.role'),
            image: "/images/team/faith-ndegeya.jpeg",
            bio: t('about.team.faith.bio')
        }
    ];

    // Reusable Team Card Component
    const TeamCard = ({ member, index }: { member: any, index: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            className="group relative bg-zinc-900/40 rounded-xl overflow-hidden border border-white/5 hover:border-[#E6C200]/30 transition-all duration-500"
        >
            <div className="aspect-[4/5] relative overflow-hidden">
                {member.image ? (
                    <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                ) : (
                    <PlaceholderImage name={member.name} />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 leading-tight font-heading">
                    {member.name}
                </h3>
                <p className="text-[#E6C200] text-xs font-bold uppercase tracking-wider mb-2">
                    {member.role}
                </p>
                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <p className="text-gray-400 text-sm font-light leading-relaxed mt-2 line-clamp-3">
                        {member.bio}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <>
            <Helmet>
                <title>Leadership & Team - AAYWA & PARTNERS</title>
                <meta name="description" content="Meet the Board, Advisors, and Team behind Project AAYWA & PARTNERS." />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FFD700] selection:text-black">
                <Header />

                <main className="pt-20">
                    {/* Hero Section */}
                    <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-900/20">
                        <div className="container mx-auto px-6 relative z-10 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="text-[#E6C200] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
                                    {t('about.structure')}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white uppercase tracking-wider"
                                    style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                                    {t('about.governance_team')}
                                </h1>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                                    {t('about.governance_desc')}
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* Board Members Section */}
                    <section className="py-20 md:py-24 border-b border-white/5">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="flex items-end justify-between mb-12 border-l-4 border-[#E6C200] pl-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                                        {t('about.board.title')}
                                    </h2>
                                    <p className="text-gray-500 font-light">{t('about.board.subtitle')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {boardMembers.map((member, index) => (
                                    <TeamCard key={index} member={member} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Board Advisors Section */}
                    <section className="py-20 md:py-24 bg-zinc-900/20 border-b border-white/5">
                        <div className="container mx-auto px-6 max-w-5xl">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                                    {t('about.advisors.title')}
                                </h2>
                                <p className="text-gray-400 max-w-xl mx-auto font-light">
                                    {t('about.advisors.subtitle')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                                {boardAdvisors.map((member, index) => (
                                    <TeamCard key={index} member={member} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Effective Members Section */}
                    <section className="py-20 md:py-24 pb-32">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="flex items-end justify-between mb-12 border-l-4 border-blue-500 pl-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                                        {t('about.effective.title')}
                                    </h2>
                                    <p className="text-gray-500 font-light">{t('about.effective.subtitle')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {effectiveMembers.map((member, index) => (
                                    <TeamCard key={index} member={member} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default AboutPage;
