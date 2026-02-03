import React from 'react';

const Model: React.FC = () => {
  const steps = [
    {
      title: 'Input Provision',
      description: 'Farmers receive compost, seedlings, and tools through invoiced inputs.',
      icon: '🌱'
    },
    {
      title: 'Production & Training',
      description: 'Farmers cultivate avocado and macadamia trees with ongoing support and training.',
      icon: '👩‍🌾'
    },
    {
      title: 'Harvest & Sales',
      description: 'Produce is harvested and sold to buyers with 50/50 profit sharing.',
      icon: '🥑'
    },
    {
      title: 'Repayment & Savings',
      description: 'Input costs are repaid at harvest, with remaining profits split equally.',
      icon: '💰'
    }
  ];

  return (
    <section id="model" className="bg-gray-50 section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Model
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive approach combining agriculture, financial services, and community development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-6">Key Components</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">Organic Fertilizer</h4>
              <p className="text-gray-600">Production and distribution of compost for sustainable farming.</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">VSLA Groups</h4>
              <p className="text-gray-600">Financial literacy and savings groups with €10 seed capital per member.</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">Post-Harvest Storage</h4>
              <p className="text-gray-600">Warehouse facilities for avocado storage with user fees and maintenance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Model;