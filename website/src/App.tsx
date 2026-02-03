import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Blog from './pages/Blog';
import ModelPage from './pages/ModelPage';
import ContactPage from './pages/ContactPage';
import Marketplace from './pages/Marketplace';
// Contact is now handled by ContactPage
import './App.css';

import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/buy" element={<Marketplace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;