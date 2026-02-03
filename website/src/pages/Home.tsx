import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/home/HeroSection';
import ImpactSnapshot from '../components/home/ImpactSnapshot';
import StorySection from '../components/home/StorySection';
import InteractiveMap from '../components/home/InteractiveMap';
import PartnersCarousel from '../components/home/PartnersCarousel';
import '../styles/home.module.css';

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AAYWA & PARTNER - Young Women. Land. Dignity.</title>
        <meta
          name="description"
          content="Empowering 100 young women farmers in Rwanda through regenerative agriculture. Fair trade, organic produce from women-led cohorts."
        />
        <meta property="og:title" content="AAYWA & PARTNER - Regenerative Agriculture in Rwanda" />
        <meta
          property="og:description"
          content="Empowering young women farmers through dignity, not charity."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div
        className="min-h-screen"
        style={{ background: '#0A0A0A' }}
      >
        <Header />

        <main>
          {/* Hero Section - Full Screen */}
          <HeroSection />

          {/* Impact Snapshot - 3 KPI Cards */}
          <ImpactSnapshot />

          {/* Story Section - Video + Testimonial */}
          <StorySection />

          {/* Interactive Map - Rwanda with Cohorts */}
          <InteractiveMap />

          {/* Partners Carousel */}
          <PartnersCarousel />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;