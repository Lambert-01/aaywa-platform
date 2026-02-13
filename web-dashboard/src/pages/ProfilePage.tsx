import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    ShieldCheckIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        language: 'en'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                location: (user as any).location || '',
                language: user.language || 'en'
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('profile.title', 'User Profile')}</h1>
                    <p className="text-slate-500">{t('profile.subtitle', 'Manage your personal information and preferences')}</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-brand-blue-600 text-white hover:bg-brand-blue-700'
                        }`}
                >
                    {isEditing ? t('common.cancel', 'Cancel') : t('profile.edit', 'Edit Profile')}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="h-24 bg-gradient-to-r from-brand-blue-600 to-brand-green-500"></div>
                    <div className="px-6 pb-6">
                        <div className="relative -mt-12 mb-4">
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-slate-400 shadow-md">
                                {user.full_name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
                        <p className="text-slate-500 capitalize mb-4">{user.role.replace('_', ' ')}</p>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center text-sm text-slate-600">
                                <EnvelopeIcon className="w-4 h-4 mr-2" />
                                {user.email}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                {t(`roles.${user.role}`, user.role)}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <GlobeAltIcon className="w-4 h-4 mr-2" />
                                {user.language === 'fr' ? 'Français' : user.language === 'rw' ? 'Kinyarwanda' : 'English'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Info / Edit Form */}
                <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-white shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900">
                            {isEditing ? t('profile.edit_details', 'Edit Personal Details') : t('profile.details', 'Personal Details')}
                        </h3>
                    </div>

                    <div className="p-6">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Language</label>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                            <option value="rw">Kinyarwanda</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-brand-blue-600 text-white rounded-lg font-medium hover:bg-brand-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                <div className="flex items-start">
                                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                                        <UserCircleIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Full Name</p>
                                        <p className="text-slate-900 font-medium">{user.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                                        <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
                                        <p className="text-slate-900 font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                                        <PhoneIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone Number</p>
                                        <p className="text-slate-900 font-medium">{(user as any).phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-2 bg-slate-50 rounded-lg mr-3">
                                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Location</p>
                                        <p className="text-slate-900 font-medium">{(user as any).location || 'Kigali, Rwanda'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
