import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { apiPost } from '../../utils/api';

interface MemberStatementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vslaId: number;
    onGenerate?: () => void;
}

const MemberStatementsModal: React.FC<MemberStatementsModalProps> = ({ isOpen, onClose, vslaId }) => {
    const [loading, setLoading] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<'individual' | 'combined'>('individual');
    const [scope, setScope] = useState<'all' | 'specific'>('all');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                memberIds: scope === 'all' ? 'all' : [], // TODO: Add specific selection logic if needed
                format: selectedFormat
            };

            const response = await apiPost<any>(`/vsla/${vslaId}/statements/generate`, payload);

            if (response.success && response.pdfUrl) {
                // Simulate download or open new tab
                window.open(response.pdfUrl, '_blank');
                onClose();
            } else {
                setError('Failed to generate statements. Please try again.');
            }
        } catch (err) {
            console.error('Statement generation error:', err);
            setError('An error occurred while generating statements.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="bg-brand-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                        Generate Statements
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statement Format</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedFormat('individual')}
                                className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-all ${selectedFormat === 'individual'
                                        ? 'border-brand-blue-500 bg-brand-blue-50 ring-1 ring-brand-blue-500'
                                        : 'border-gray-200 hover:border-brand-blue-300'
                                    }`}
                            >
                                <span className="text-2xl mb-2">👤</span>
                                <span className={`text-sm font-medium ${selectedFormat === 'individual' ? 'text-brand-blue-700' : 'text-gray-600'}`}>Individual PDFs</span>
                                <span className="text-xs text-gray-400 mt-1">One file per member</span>
                            </button>

                            <button
                                onClick={() => setSelectedFormat('combined')}
                                className={`p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-all ${selectedFormat === 'combined'
                                        ? 'border-brand-blue-500 bg-brand-blue-50 ring-1 ring-brand-blue-500'
                                        : 'border-gray-200 hover:border-brand-blue-300'
                                    }`}
                            >
                                <span className="text-2xl mb-2">📚</span>
                                <span className={`text-sm font-medium ${selectedFormat === 'combined' ? 'text-brand-blue-700' : 'text-gray-600'}`}>Combined PDF</span>
                                <span className="text-xs text-gray-400 mt-1">All members in one file</span>
                            </button>
                        </div>
                    </div>

                    {/* Scope Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Scope</label>
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value as 'all' | 'specific')}
                            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        >
                            <option value="all">All Members (Active)</option>
                            <option value="specific" disabled>Specific Members (Coming Soon)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Includes current balance, savings history, and loan status.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-brand-blue-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Generating...' : 'Generate Statements'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberStatementsModal;
