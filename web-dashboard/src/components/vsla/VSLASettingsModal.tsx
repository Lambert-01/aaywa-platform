import React, { useState, useEffect } from 'react';
import { XMarkIcon, Cog6ToothIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPost, apiPut } from '../../utils/api';

interface VSLASettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vslaId: number;
}

const VSLASettingsModal: React.FC<VSLASettingsModalProps> = ({ isOpen, onClose, vslaId }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [settings, setSettings] = useState({
        name: '',
        meetingDay: 'Wednesday',
        meetingTime: '14:00',
        maxLoanAmount: 50000,
        minSavingsTarget: 2000,
        interestRate: 5
    });

    // Fetch current settings when opening
    useEffect(() => {
        if (isOpen && vslaId) {
            fetchSettings();
        }
    }, [isOpen, vslaId]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // In a real app, this would be GET /vsla/:id/settings or just part of GET /vsla/:id
            // For now, we simulate fetching current settings or just fetch basic details
            const data = await apiGet<any>(`/vsla/${vslaId}`);
            setSettings(prev => ({
                ...prev,
                name: data.name,
                // Simulate other settings preservation if they existed
            }));
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiPut(`/vsla/${vslaId}/settings`, settings);
            onClose();
            // Ideally trigger a refresh of the parent VSLA name
            // window.location.reload(); // Simple refresh for now or let parent handle
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                {/* Header */}
                <div className="bg-brand-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Cog6ToothIcon className="w-5 h-5 mr-2" />
                        VSLA Configuration
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading settings...</div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* General Settings */}
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">General Details</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">VSLA Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={settings.name}
                                        onChange={e => setSettings({ ...settings, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Meeting Schedule */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">Meeting Schedule</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meeting Day</label>
                                    <select
                                        value={settings.meetingDay}
                                        onChange={e => setSettings({ ...settings, meetingDay: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meeting Time</label>
                                    <input
                                        type="time"
                                        value={settings.meetingTime}
                                        onChange={e => setSettings({ ...settings, meetingTime: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            </div>

                            {/* Financial Rules */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">Financial Rules</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Loan Amount (RWF)</label>
                                    <input
                                        type="number"
                                        min="1000"
                                        value={settings.maxLoanAmount}
                                        onChange={e => setSettings({ ...settings, maxLoanAmount: Number(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={settings.interestRate}
                                            onChange={e => setSettings({ ...settings, interestRate: Number(e.target.value) })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Min Savings</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={settings.minSavingsTarget}
                                            onChange={e => setSettings({ ...settings, minSavingsTarget: Number(e.target.value) })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Officer Rotation Hint */}
                            <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start">
                                <UserGroupIcon className="w-5 h-5 text-brand-blue-600 mr-3 mt-0.5" />
                                <div>
                                    <h5 className="text-sm font-bold text-brand-blue-900">Officer Management</h5>
                                    <p className="text-xs text-brand-blue-700 mt-1">
                                        To rotate officers (Chair, Treasurer, Secretary), please use the "Officer Management" card on the main dashboard.
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-brand-blue-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-brand-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VSLASettingsModal;
