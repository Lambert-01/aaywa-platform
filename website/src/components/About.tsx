import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-white section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About AAYWA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A social business initiative in Rwanda that empowers young women and adolescent mothers
            through sustainable agriculture and financial inclusion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👩‍🌾</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">100 Women Farmers</h3>
            <p className="text-gray-600">
              Supporting young women and adolescent mothers in rural Rwanda to build sustainable livelihoods.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Nutrition-Sensitive Agriculture</h3>
            <p className="text-gray-600">
              Promoting healthy farming practices that improve both food security and nutritional outcomes.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Financial Inclusion</h3>
            <p className="text-gray-600">
              Building financial literacy and access through Village Savings and Loan Associations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;