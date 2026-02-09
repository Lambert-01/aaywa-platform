import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/model', label: t('nav.model') },
    { path: '/blog', label: t('header.impact') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: isScrolled ? '#0A0A0A' : 'transparent',
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/aaywa-logo.png"
                alt="AAYWA & PARTNERS Logo"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className="text-2xl font-bold text-white tracking-widest hidden sm:block"
                style={{
                  fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                  letterSpacing: '2px',
                }}
              >
                AAYWA & PARTNERS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <span
                    className="text-lg transition-colors duration-300"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: location.pathname === link.path ? '#E6C200' : '#FFFFFF',
                      letterSpacing: '1px',
                      fontWeight: 400,
                    }}
                  >
                    {link.label}
                  </span>
                  {/* Hover Underline */}
                  <span
                    className="absolute left-0 bottom-0 w-full h-0.5 transform origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{ background: '#E6C200' }}
                  />
                </Link>
              ))}

              <LanguageSwitcher />

              {/* CTA Button */}
              <Link to="/buy">
                <button
                  className="px-6 py-2.5 rounded font-semibold transition-all duration-300"
                  style={{
                    background: '#E6C200',
                    color: '#0A0A0A',
                    letterSpacing: '1px',
                    fontSize: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {t('header.buy_produce')}
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="#FFFFFF"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl transition-colors duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: location.pathname === link.path ? '#E6C200' : '#FFFFFF',
                  letterSpacing: '2px',
                  fontWeight: 600,
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/buy" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className="px-12 py-4 rounded font-bold text-xl"
                style={{
                  background: '#E6C200',
                  color: '#0A0A0A',
                  letterSpacing: '2px',
                }}
              >
                {t('header.buy_produce')}
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;