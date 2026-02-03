import React from 'react';

const Platform: React.FC = () => {
  const features = [
    {
      title: 'Role-Based Dashboard',
      description: 'Tailored interfaces for farmers, managers, agronomists, and buyers with relevant features and data.',
      icon: '📊'
    },
    {
      title: 'Offline-First Mobile App',
      description: 'Works without internet connection, syncing data when connectivity is restored.',
      icon: '📱'
    },
    {
      title: 'Financial Tracking',
      description: 'Complete audit trail of inputs, sales, profit sharing, and VSLA transactions.',
      icon: '💰'
    },
    {
      title: 'Geospatial Mapping',
      description: 'Interactive maps showing farm locations, cohorts, and warehouse facilities.',
      icon: '🗺️'
    },
    {
      title: 'Training Management',
      description: 'Digital tracking of sessions, attendance, and cascade training programs.',
      icon: '📚'
    },
    {
      title: 'Warehouse Management',
      description: 'Inventory tracking, storage fees, and maintenance scheduling for post-harvest handling.',
      icon: '🏭'
    }
  ];

  return (
    <section id="platform" className="bg-gray-50 section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Digital Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive digital ecosystem designed for rural development in low-connectivity environments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Technical Excellence</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Secure</h4>
              <p className="text-sm text-gray-600">Phone OTP authentication, encrypted data, role-based access</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Scalable</h4>
              <p className="text-sm text-gray-600">Built for 1,000+ farmers with cloud infrastructure</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Offline-First</h4>
              <p className="text-sm text-gray-600">Works in low-connectivity rural environments</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">User-Centric</h4>
              <p className="text-sm text-gray-600">Simple interfaces in English and Kinyarwanda</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Platform;