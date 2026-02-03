import React from 'react';

const Partners: React.FC = () => {
  const partners = [
    { name: 'Sanza Alkebulan', type: 'Implementing Partner', logo: '🌱' },
    { name: 'Afro Source', type: 'Buyer Partner', logo: '🥑' },
    { name: 'Africa\'s Talking', type: 'Technology Partner', logo: '📱' },
    { name: 'Google Cloud', type: 'Infrastructure Partner', logo: '☁️' }
  ];

  return (
    <section id="partners" className="bg-gray-50 section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Working together with organizations committed to rural development and women empowerment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">{partner.logo}</div>
              <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
              <p className="text-gray-600 text-sm">{partner.type}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Join Our Network</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for partners who share our vision of empowering women through sustainable agriculture.
            Whether you're a buyer, technology provider, or development organization, we'd love to hear from you.
          </p>
          <button className="btn-primary">
            Become a Partner
          </button>
        </div>
      </div>
    </section>
  );
};

export default Partners;