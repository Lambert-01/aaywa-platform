import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactHero from '../components/contact/ContactHero';
import ContactMethods from '../components/contact/ContactMethods';
import ContactForm from '../components/contact/ContactForm';
import LocationSection from '../components/contact/LocationSection';
import SocialProof from '../components/contact/SocialProof';

const ContactPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('contact.title')}</title>
                <meta name="description" content={t('contact.description')} />
            </Helmet>

            <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FFD700] selection:text-black">
                <Header />

                <main>
                    <ContactHero />
                    <ContactMethods />
                    <ContactForm />
                    <LocationSection />
                    <SocialProof />
                </main>

                <Footer />
            </div>
        </>
    );
};

export default ContactPage;
