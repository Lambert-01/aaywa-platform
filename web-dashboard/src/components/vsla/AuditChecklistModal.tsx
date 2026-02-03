import React, { useState } from 'react';

interface AuditChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    vslaName: string;
}

const AuditChecklistModal: React.FC<AuditChecklistModalProps> = ({ isOpen, onClose, vslaName }) => {
    const [checklist, setChecklist] = useState({
        cashbookMatches: false,
        passbooksMatch: false,
        transactionsDocumented: false,
        noUnauthorizedWithdrawals: false,
        constitutionAdhered: false
    });

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheck = (key: keyof typeof checklist) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Audit Report Generated & Saved!');
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-blue-900 text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold">Audit Process</h2>
                        <p className="text-brand-blue-200 text-sm">Quarterly compliance check for {vslaName}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <p className="font-semibold text-gray-700">Compliance Checklist</p>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={checklist.cashbookMatches} onChange={() => handleCheck('cashbookMatches')} className="w-5 h-5 text-brand-blue-600 rounded focus:ring-brand-blue-500" />
                            <span className="text-gray-700">Cashbook balance matches actual cash in box</span>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={checklist.passbooksMatch} onChange={() => handleCheck('passbooksMatch')} className="w-5 h-5 text-brand-blue-600 rounded focus:ring-brand-blue-500" />
                            <span className="text-gray-700">Member passbooks match ledger entries</span>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={checklist.transactionsDocumented} onChange={() => handleCheck('transactionsDocumented')} className="w-5 h-5 text-brand-blue-600 rounded focus:ring-brand-blue-500" />
                            <span className="text-gray-700">All loans & repayments properly countersigned</span>
                        </label>

                        <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={checklist.noUnauthorizedWithdrawals} onChange={() => handleCheck('noUnauthorizedWithdrawals')} className="w-5 h-5 text-brand-blue-600 rounded focus:ring-brand-blue-500" />
                            <span className="text-gray-700">No evidence of unauthorized withdrawals</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auditor Notes / Grievances</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500"
                            rows={3}
                            placeholder="Record any discrepancies or member disputes..."
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !Object.values(checklist).every(Boolean)}
                        className={`px-6 py-2 rounded-lg text-white font-bold shadow-md transition-all
                            ${isSubmitting || !Object.values(checklist).every(Boolean)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-brand-blue-600 hover:bg-brand-blue-700'}`}
                    >
                        {isSubmitting ? 'Generating Report...' : 'Submit Audit & Generate PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditChecklistModal;
