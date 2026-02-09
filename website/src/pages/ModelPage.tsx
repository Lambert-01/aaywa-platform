import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import ModelHero from '../components/model/ModelHero';
import FourStepJourney from '../components/model/FourStepJourney';
import CoreInnovations from '../components/model/CoreInnovations';
import ModelImpactSnapshot from '../components/model/ModelImpactSnapshot';
import CohortMap from '../components/model/CohortMap';

const ModelPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <Helmet>
                <title>The AAYWA & PARTNERS Model | Regenerative Agriculture Blueprint</title>
                <meta name="description" content="Discover our scalable blueprint for women-led regenerative agriculture. 50/50 profit sharing, organic inputs, and financial inclusion." />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FFD700] selection:text-black">
                <Header />

                <main>
                    <ModelHero />
                    <FourStepJourney />
                    <CoreInnovations />
                    <ModelImpactSnapshot />
                    <CohortMap />

                    {/* Final CTA Section */}
                    <section className="py-24 bg-gradient-to-t from-[#00A1DE]/10 to-[#0A0A0A] text-center border-t border-white/5">
                        <div className="container mx-auto px-6">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Clash_Grotesk'] uppercase">
                                {t('model_page.cta.title')}
                            </h2>
                            <p className="text-xl text-gray-300 font-light mb-10 max-w-2xl mx-auto">
                                {t('model_page.cta.text')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link to="/contact">
                                    <button className="px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-wider rounded hover:scale-105 hover:shadow-[0_4px_20px_rgba(255,215,0,0.3)] transition-all duration-300 min-w-[200px]">
                                        {t('model_page.cta.contact')}
                                    </button>
                                </Link>
                                <button className="px-8 py-4 border-2 border-[#00A1DE] text-[#00A1DE] font-bold uppercase tracking-wider rounded hover:bg-[#00A1DE]/10 transition-all duration-300 min-w-[200px]">
                                    {t('model_page.cta.download')}
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default ModelPage;
