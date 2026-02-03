import React, { useState } from 'react';

interface CartItem {
    productId: string;
    cropType: string;
    variety: string;
    quantity: number;
    pricePerKg: number;
    subtotal: number;
}

interface CheckoutFormProps {
    items: CartItem[];
    totalValue: number;
    onSubmit: (formData: CheckoutFormData) => void;
    onBack: () => void;
}

export interface CheckoutFormData {
    buyerName: string;
    contactPerson: string;
    phone: string;
    email: string;
    deliveryAddress: string;
    deliveryDay: string;
    specialInstructions: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ items, totalValue, onSubmit, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CheckoutFormData>({
        buyerName: '',
        contactPerson: '',
        phone: '',
        email: '',
        deliveryAddress: '',
        deliveryDay: 'Wednesday',
        specialInstructions: '',
    });
    const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

    // Validation Logic
    const validatePhone = (phone: string) => {
        const rwandaPhoneRegex = /^(\+250|0)7[0-9]{8}$/;
        return rwandaPhoneRegex.test(phone.replace(/\s/g, ''));
    };

    const validateStep1 = () => {
        const newErrors: Partial<CheckoutFormData> = {};
        if (!formData.buyerName.trim()) newErrors.buyerName = 'Company/Name is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Enter valid Rwandan phone (+250...)';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Partial<CheckoutFormData> = {};
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const updateField = (field: keyof CheckoutFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    // UI Components
    interface InputFieldProps {
        label: string;
        value: string;
        field: keyof CheckoutFormData;
        type?: string;
        placeholder?: string;
        icon?: React.ReactNode;
    }

    const InputField = ({ label, value, field, type = 'text', placeholder, icon }: InputFieldProps) => (
        <div className="relative group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                {label} {errors[field] && <span className="text-red-500 normal-case">- {errors[field]}</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => updateField(field, e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white text-gray-900 border-2 rounded-xl focus:ring-0 outline-none transition-all font-medium placeholder-gray-400
                        ${errors[field]
                            ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                            : 'border-gray-100 focus:border-green-500 focus:shadow-[0_4px_20px_-2px_rgba(16,185,129,0.2)] hover:border-gray-200'
                        }`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header / Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

                    {[
                        { num: 1, label: 'Contact' },
                        { num: 2, label: 'Delivery' },
                        { num: 3, label: 'Confirm' }
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center group cursor-default">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 border-4 
                                ${step >= s.num
                                    ? 'bg-green-600 border-green-50 text-white shadow-green-200'
                                    : 'bg-white border-white text-gray-400'
                                }`}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300
                                ${step >= s.num ? 'text-green-700' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

                <div className="p-8">
                    {/* Step 1: Contact Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                                <p className="text-gray-500 text-sm mt-1">We need this to clear your order.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Name / Organization"
                                        field="buyerName"
                                        value={formData.buyerName}
                                        placeholder="e.g. Acme Fresh Ltd"
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                    />
                                </div>
                                <InputField
                                    label="Contact Person"
                                    field="contactPerson"
                                    value={formData.contactPerson}
                                    placeholder="Full Name"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                />
                                <InputField
                                    label="Phone Number"
                                    field="phone"
                                    value={formData.phone}
                                    placeholder="+250 78..."
                                    type="tel"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                />
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Email Address (Optional)"
                                        field="email"
                                        value={formData.email}
                                        placeholder="invoices@company.com"
                                        type="email"
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Delivery */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
                                <p className="text-gray-500 text-sm mt-1">Where should we bring the goods?</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                                        Delivery Address {errors.deliveryAddress && <span className="text-red-500 normal-case">- Required</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-3 pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <textarea
                                            value={formData.deliveryAddress}
                                            onChange={(e) => updateField('deliveryAddress', e.target.value)}
                                            rows={3}
                                            className={`w-full pl-10 pr-4 py-3 bg-white text-gray-900 border-2 rounded-xl focus:ring-0 outline-none transition-all font-medium placeholder-gray-400
                                                ${errors.deliveryAddress
                                                    ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                                                    : 'border-gray-100 focus:border-green-500 focus:shadow-[0_4px_20px_-2px_rgba(16,185,129,0.2)] hover:border-gray-200'
                                                }`}
                                            placeholder="Street name, District, Sector..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Preferred Day</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <select
                                                value={formData.deliveryDay}
                                                onChange={(e) => updateField('deliveryDay', e.target.value)}
                                                className="w-full pl-10 pr-10 py-3 bg-white text-gray-900 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-0 outline-none appearance-none font-medium hover:border-gray-200 cursor-pointer"
                                            >
                                                <option value="Monday">Monday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Friday">Friday</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <InputField
                                        label="Instructions (Optional)"
                                        field="specialInstructions"
                                        value={formData.specialInstructions}
                                        placeholder="Gate code, call upon arrival..."
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                                <p className="text-gray-500 text-sm mt-1">Please review before confirming.</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Customer</p>
                                        <p className="font-bold text-gray-900">{formData.buyerName}</p>
                                        <p className="text-gray-600">{formData.contactPerson}</p>
                                        <p className="text-gray-600">{formData.phone}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Delivery</p>
                                        <p className="font-bold text-gray-900">{formData.deliveryDay}s</p>
                                        <p className="text-gray-600">{formData.deliveryAddress}</p>
                                        {formData.specialInstructions && (
                                            <p className="text-orange-500 text-xs mt-1">" {formData.specialInstructions} "</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 text-left text-xs uppercase tracking-wider">
                                                <th className="pb-3">Product</th>
                                                <th className="pb-3 text-right">Qty</th>
                                                <th className="pb-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-900 divide-y divide-gray-100 font-medium">
                                            {items.map((item) => (
                                                <tr key={item.productId}>
                                                    <td className="py-3">{item.cropType} - {item.variety}</td>
                                                    <td className="py-3 text-right">{item.quantity} boxes</td>
                                                    <td className="py-3 text-right">{item.subtotal.toLocaleString()} RWF</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t border-gray-300">
                                                <td colSpan={2} className="pt-4 text-right font-bold text-gray-900">Total Payable</td>
                                                <td className="pt-4 text-right font-extrabold text-2xl text-green-600">{totalValue.toLocaleString()} RWF</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p>You will receive an invoice via SMS/Email. Payment is seamlessly handled via Mobile Money upon delivery or approval.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50/80 backdrop-blur p-6 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={step === 1 ? onBack : () => setStep(step - 1)}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-white transition-all hover:shadow-sm"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 group"
                        >
                            Continue
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => onSubmit(formData)}
                            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 hover:shadow-green-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                        >
                            Confirm Order
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CheckoutForm;
