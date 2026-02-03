import React from 'react';

const Impact: React.FC = () => {
  const metrics = [
    { number: '100', label: 'Women Farmers Empowered', icon: '👩‍🌾' },
    { number: '€10', label: 'VSLA Seed Capital per Member', icon: '💰' },
    { number: '50/50', label: 'Profit Sharing Model', icon: '🤝' },
    { number: '€2.50', label: 'Daily Compost Worker Wage', icon: '🌱' }
  ];

  return (
    <section id="impact" className="bg-white section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Measuring success through sustainable livelihoods, financial inclusion, and community development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{metric.icon}</div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{metric.number}</div>
              <div className="text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Key Outcomes</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-3">Economic Empowerment</h4>
              <p className="text-gray-600">
                Farmers gain financial independence through fair profit sharing and VSLA participation,
                building long-term economic security for themselves and their families.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-3">Sustainable Agriculture</h4>
              <p className="text-gray-600">
                Organic fertilizer production and nutrition-sensitive farming practices improve
                soil health, crop yields, and food security in local communities.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-3">Community Development</h4>
              <p className="text-gray-600">
                VSLA groups foster financial literacy and social cohesion, while training programs
                build skills and knowledge for ongoing development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;