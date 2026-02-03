import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { path: '/', label: 'Home' },
        { path: '/model', label: 'Our Model' },
        { path: '/buy', label: 'Buy Produce' },
        { path: '/contact', label: 'Contact' },
    ];

    const socialLinks = [
        {
            name: 'Instagram',
            icon: (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>),
            url: '#'
        },
        {
            name: 'LinkedIn',
            icon: (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>),
            url: '#'
        },
        {
            name: 'YouTube',
            icon: (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>),
            url: '#'
        },
    ];

    return (
        <footer
            className="py-16 md:py-20"
            style={{
                background: 'linear-gradient(180deg, #0A0A0A 0%, #000000 100%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* 4-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Logo Column */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <span
                                className="text-3xl font-bold"
                                style={{
                                    fontFamily: "'Clash Grotesk', 'Inter', sans-serif",
                                    color: '#FFFFFF',
                                    letterSpacing: '3px',
                                }}
                            >
                                AAYWA & PARTNERS
                            </span>
                            <span className="text-2xl">🌱</span>
                        </Link>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 300,
                            }}
                        >
                            Empowering young women farmers through regenerative agriculture in Rwanda.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: '#E6C200',
                                letterSpacing: '1px',
                            }}
                        >
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="group inline-block"
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '15px',
                                            fontWeight: 300,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#FFD700';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: '#E6C200',
                                letterSpacing: '1px',
                            }}
                        >
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:info@aaywa.rw"
                                    className="flex items-center gap-2 group"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '15px',
                                        fontWeight: 300,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#E6C200';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                    }}
                                >
                                    info@aaywa.rw
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+250788000000"
                                    className="flex items-center gap-2 group"
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '15px',
                                        fontWeight: 300,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#E6C200';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                    }}
                                >
                                    +250 788 000 000
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                color: '#E6C200',
                                letterSpacing: '1px',
                            }}
                        >
                            Follow Us
                        </h3>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    aria-label={social.name}
                                    className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: '#FFFFFF',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#E6C200';
                                        e.currentTarget.style.color = '#0A0A0A';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = '#FFFFFF';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    className="pt-8 text-center border-t"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                    <p
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '14px',
                            fontWeight: 300,
                            letterSpacing: '0.5px',
                        }}
                    >
                        © {currentYear} AAYWA & PARTNERS. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
