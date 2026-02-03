import React from 'react';
import '../../styles/contact.module.css';

const SocialProof: React.FC = () => {
    return (
        <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative p-10 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <span className="text-6xl text-[#FFD700] opacity-20 absolute top-4 left-4 font-serif">"</span>
                        <p className="text-xl text-gray-200 font-light italic mb-6 relative z-10">
                            AAYWA & PARTNERS proves that regenerative agriculture and women’s economic inclusion can go hand-in-hand. Their model ensures sustainability from the soil up.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-700" />
                            <div>
                                <p className="text-white font-bold text-sm">Afro Source Representative</p>
                                <p className="text-[#00A1DE] text-xs uppercase tracking-wide">Primary Export Partner</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative p-10 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <span className="text-6xl text-[#00A1DE] opacity-20 absolute top-4 left-4 font-serif">"</span>
                        <p className="text-xl text-gray-200 font-light italic mb-6 relative z-10">
                            The 50/50 model builds real trust. We are not just giving supplies; we are building a business together with these farmers.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-700" />
                            <div>
                                <p className="text-white font-bold text-sm">Lead Agronomist</p>
                                <p className="text-[#FFD700] text-xs uppercase tracking-wide">Sanza Alkebulan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
