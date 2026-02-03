import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { apiPost } from '../../utils/api';

interface EmailSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vslaId: number;
    vslaName: string;
}

const EmailSummaryModal: React.FC<EmailSummaryModalProps> = ({ isOpen, onClose, vslaId, vslaName }) => {
    const [loading, setLoading] = useState(false);
    const [recipients, setRecipients] = useState<'all' | 'officers'>('all');
    const [customMessage, setCustomMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSend = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            const payload = {
                recipients,
                customMessage
            };

            const response = await apiPost<any>(`/vsla/${vslaId}/summary/email`, payload);

            if (response.success) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setCustomMessage('');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Email send error:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
                {/* Header */}
                <div className="bg-brand-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        Email Weekly Summary
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Recipient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 border rounded-md p-3 cursor-pointer transition-all ${recipients === 'all' ? 'border-brand-blue-500 bg-brand-blue-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="recipients"
                                    value="all"
                                    checked={recipients === 'all'}
                                    onChange={() => setRecipients('all')}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <span className="block font-medium text-gray-900">All Members</span>
                                    <span className="text-xs text-gray-500">25 recipients</span>
                                </div>
                            </label>

                            <label className={`flex-1 border rounded-md p-3 cursor-pointer transition-all ${recipients === 'officers' ? 'border-brand-blue-500 bg-brand-blue-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="recipients"
                                    value="officers"
                                    checked={recipients === 'officers'}
                                    onChange={() => setRecipients('officers')}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <span className="block font-medium text-gray-900">Officers Only</span>
                                    <span className="text-xs text-gray-500">Chair, Treasurer, Sec.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600 font-mono">
                        <p className="font-bold mb-2">Subject: Weekly VSLA Summary - {vslaName}</p>
                        <p>Dear Members,</p>
                        <p className="mt-2">Here are this week's highlights:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Total Savings: RWF [Calculated]</li>
                            <li>New Loans: [Count] members</li>
                            <li>Upcoming Meeting: Wednesday, 2:00 PM</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            {customMessage ? (
                                <p className="text-brand-blue-700 italic">{customMessage}</p>
                            ) : (
                                <span className="text-gray-400 italic text-xs">[Additional message will appear here]</span>
                            )}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message (Optional)</label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={3}
                            placeholder="Add a note about upcoming agenda items..."
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                            Failed to send email summary. Please check connection.
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-100">
                            ✅ Emails sent successfully to {recipients === 'all' ? '25' : '3'} recipients.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading || status === 'success'}
                        className="px-6 py-2 bg-brand-blue-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-brand-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : status === 'success' ? 'Sent!' : (
                            <>
                                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                                Send Summary
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSummaryModal;
