import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/contact.module.css';

const ContactMethods: React.FC = () => {
    const { t } = useTranslation();

    const methods = [
        {
            title: t('contact.methods.general'),
            email: 'info@aaywa.rw',
            phone: '+250 788 000 000',
            icon: '✉️'
        },
        {
            title: t('contact.methods.buy'),
            email: 'orders@aaywa.rw',
            phone: '+250 788 111 111',
            icon: '🛒'
        },
        {
            title: t('contact.methods.partnerships'),
            email: 'partners@aaywa.rw',
            phone: '+250 788 222 222',
            icon: '🤝'
        }
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.2 }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="py-20 bg-[#0A0A0A] -mt-20 relative z-20">
            <div className="container mx-auto px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {methods.map((method) => (
                        <motion.div
                            key={method.title}
                            variants={cardVariants}
                            className="methodCard p-8 rounded-lg text-center"
                        >
                            <div className="text-4xl mb-6">{method.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-4 font-['Clash_Grotesk'] uppercase tracking-wide">
                                {method.title}
                            </h3>
                            <a
                                href={`mailto:${method.email}`}
                                className="block text-[#FFD700] hover:underline mb-2 transition-colors"
                            >
                                {method.email}
                            </a>
                            <a
                                href={`tel:${method.phone}`}
                                className="block text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                {method.phone}
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ContactMethods;
