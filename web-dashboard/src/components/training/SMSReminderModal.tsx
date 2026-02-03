import React, { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface SMSReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: any[];
}

const SMSReminderModal: React.FC<SMSReminderModalProps> = ({ isOpen, onClose, sessions }) => {
    const [selectedAudience, setSelectedAudience] = useState('all');
    const [selectedCohort, setSelectedCohort] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [message, setMessage] = useState('Reminder: You have an upcoming training session. Please confirm your attendance.');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        setIsSending(true);
        // TODO: Implement actual SMS sending logic
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setIsSending(false);
        onClose();
    };

    const estimatedRecipients = selectedAudience === 'all' ? 150 :
        selectedAudience === 'champions' ? 20 :
            selectedAudience === 'cohort' ? 35 : 25;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <PaperAirplaneIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Send SMS Reminders</h2>
                                <p className="text-blue-100 text-sm">Notify participants about training sessions</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Audience Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Audience
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedAudience('all')}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedAudience === 'all'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-medium">All Participants</div>
                                <div className="text-sm text-gray-500">~150 farmers</div>
                            </button>
                            <button
                                onClick={() => setSelectedAudience('champions')}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedAudience === 'champions'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-medium">Champions Only</div>
                                <div className="text-sm text-gray-500">~20 champions</div>
                            </button>
                            <button
                                onClick={() => setSelectedAudience('cohort')}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedAudience === 'cohort'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-medium">Specific Cohort</div>
                                <div className="text-sm text-gray-500">Select below</div>
                            </button>
                            <button
                                onClick={() => setSelectedAudience('session')}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedAudience === 'session'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-medium">Session Attendees</div>
                                <div className="text-sm text-gray-500">Select below</div>
                            </button>
                        </div>
                    </div>

                    {/* Conditional Selectors */}
                    {selectedAudience === 'cohort' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Cohort
                            </label>
                            <select
                                value={selectedCohort}
                                onChange={(e) => setSelectedCohort(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Choose a cohort...</option>
                                <option value="1">Cohort 1 - Northern Region</option>
                                <option value="2">Cohort 2 - Eastern Region</option>
                                <option value="3">Cohort 3 - Southern Region</option>
                                <option value="4">Cohort 4 - Western Region</option>
                            </select>
                        </div>
                    )}

                    {selectedAudience === 'session' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Session
                            </label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Choose a session...</option>
                                {sessions.slice(0, 5).map((session: any) => (
                                    <option key={session.id} value={session.id}>
                                        {session.title} - {new Date(session.date).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Message Template */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Content
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            maxLength={160}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Enter your message (max 160 characters)"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">
                                {message.length}/160 characters
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                                ~{estimatedRecipients} recipients
                            </span>
                        </div>
                    </div>

                    {/* Quick Templates */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Templates
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMessage('Reminder: Training session tomorrow at 10 AM. Please confirm attendance.')}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                                Tomorrow's Session
                            </button>
                            <button
                                onClick={() => setMessage('New training materials available. Check the app for more details.')}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                                New Materials
                            </button>
                            <button
                                onClick={() => setMessage('VSLA meeting scheduled for this week. Your participation is important.')}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                                VSLA Meeting
                            </button>
                            <button
                                onClick={() => setMessage('Congratulations! You have been selected as a Champion. Training starts soon.')}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                                Champion Selection
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                        <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                            {message || 'Your message will appear here...'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="h-5 w-5" />
                                <span>Send SMS</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SMSReminderModal;
