import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    UserPlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../api/config';

const Register: React.FC = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        requested_role: 'field_facilitator',
        message: ''
    });

    // Check for invite params
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const role = params.get('role');

        if (email || role) {
            setFormData(prev => ({
                ...prev,
                email: email || prev.email,
                requested_role: role || prev.requested_role
            }));
        }
    }, [location.search]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    requested_role: 'field_facilitator',
                    message: ''
                });
            } else {
                setError(data.error || 'Registration request failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* Success Card */}
                <div className="relative max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                            Request Submitted!
                        </h1>
                        <p className="text-gray-600 leading-relaxed">
                            Your registration request has been successfully submitted. An administrator will review your request and contact you via email.
                        </p>
                    </div>

                    <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-emerald-800 font-medium">
                            <strong>What's next?</strong><br />
                            You will receive an email with your login credentials once your request is approved.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="inline-block w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Main Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Glass Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <UserPlusIcon className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                                Join AAYWA & PARTNERS
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base font-medium">
                                Request access to the dashboard
                            </p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Full Name */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserPlusIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <input
                                            id="full_name"
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Enter your full name"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your.email@example.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+250 788 123 456"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Requested Role */}
                                <div>
                                    <label htmlFor="requested_role" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Requesting Role <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <BriefcaseIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <select
                                            id="requested_role"
                                            value={formData.requested_role}
                                            onChange={(e) => setFormData({ ...formData, requested_role: e.target.value })}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 outline-none text-gray-900 appearance-none bg-white"
                                        >
                                            <option value="field_facilitator">Field Facilitator</option>
                                            <option value="agronomist">Agronomist</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message to Administrator
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us why you're requesting access..."
                                            rows={4}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                                <span className="relative flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            Submit Registration Request
                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-white/90 text-sm font-medium drop-shadow-lg">
                            Questions? Contact us at support@aaywa.rw
                        </p>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
            `}</style>
        </div>
    );
};

export default Register;
