import React from 'react';
import '../../styles/contact.module.css';

const LocationSection: React.FC = () => {
    return (
        <section className="py-20 bg-[#111111]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-8 font-['Clash_Grotesk'] uppercase">
                            Visit Our Operations
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[#FFD700] text-sm uppercase tracking-widest mb-2 font-bold">
                                    Headquarters
                                </h3>
                                <p className="text-gray-300 text-lg font-light">
                                    Southern Province, Rwanda<br />
                                    (Near Huye District Center)
                                </p>
                            </div>

                            <div>
                                <h3 className="text-[#00A1DE] text-sm uppercase tracking-widest mb-2 font-bold">
                                    Hours
                                </h3>
                                <p className="text-gray-300 text-lg font-light">
                                    Monday – Friday<br />
                                    8:00 AM – 5:00 PM CAT
                                </p>
                            </div>

                            <p className="text-gray-500 text-sm italic pt-4">
                                * Visits by appointment only to ensure biosecurity on our farms.
                            </p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-2xl mapContainer border border-gray-800">
                        <iframe
                            title="AAYWA & PARTNERS Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15946.818815159846!2d29.7333!3d-2.5966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c30e70460fba63%3A0x6b86ce8366de549f!2sHuye%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LocationSection;
