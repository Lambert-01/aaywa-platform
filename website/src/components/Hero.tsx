import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white section-padding">
      <div className="container-max">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-secondary">
                Learn More
              </button>
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                Join Our Network
              </button>
            </div>
          </div>
          <div className="text-center">
            <div className="text-8xl mb-4">🌱👩‍🌾</div>
            <p className="text-lg opacity-90">
              Building sustainable livelihoods through technology and community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;