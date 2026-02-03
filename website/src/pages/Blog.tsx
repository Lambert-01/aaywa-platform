import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';

const Blog: React.FC = () => {
  const posts = [
    {
      title: 'The Power of 50/50 Profit Sharing in Agriculture',
      excerpt: 'How equitable profit distribution is transforming women\'s economic empowerment in Rwanda.',
      date: '2024-01-15',
      author: 'AAYWA & PARTNER Team',
      image: '📊'
    },
    {
      title: 'Organic Fertilizer Production: A Sustainable Solution',
      excerpt: 'Exploring how compost production creates jobs and improves soil health for smallholder farmers.',
      date: '2024-01-10',
      author: 'Dr. Marie Claire',
      image: '🌱'
    },
    {
      title: 'VSLA Groups: Building Financial Resilience',
      excerpt: 'How Village Savings and Loan Associations are creating financial security for rural women.',
      date: '2024-01-05',
      author: 'Jean Baptiste',
      image: '💰'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Blog - AAYWA & PARTNER</title>
        <meta name="description" content="Latest insights on women empowerment, sustainable agriculture, and rural development in Rwanda." />
      </Helmet>

      <Header />

      <main className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AAYWA & PARTNER Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stories, insights, and learnings from our work empowering women farmers in Rwanda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="text-4xl mb-4">{post.image}</div>
                  <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Blog;