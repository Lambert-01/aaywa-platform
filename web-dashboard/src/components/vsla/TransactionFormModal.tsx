import React, { useState, useEffect } from 'react';
import { useVSLAData } from './useVSLAData';
import { calculateStipend } from '../../utils/transactionCalculations';

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    vslaId: number;
}

type TransactionType = 'savings' | 'loan_disbursement' | 'loan_repayment' | 'stipend' | 'maintenance_expense' | 'input_repayment';

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSubmit, vslaId }) => {
    const { members, fetchMembers } = useVSLAData(vslaId);

    // Form State
    const [type, setType] = useState<TransactionType>('savings');
    const [memberId, setMemberId] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');

    // Dynamic Fields State
    const [repaymentDate, setRepaymentDate] = useState('');
    const [interestRate, setInterestRate] = useState(5);
    const [workType, setWorkType] = useState('Compost Production');
    const [daysWorked, setDaysWorked] = useState(0);
    const [vendorName, setVendorName] = useState('');
    const [saleReference, setSaleReference] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            // Reset form
            setAmount(0);
            setDescription('');
            setMemberId('');
        }
    }, [isOpen, fetchMembers]);

    // Stipend Auto-Calculation
    useEffect(() => {
        if (type === 'stipend') {
            setAmount(calculateStipend(daysWorked));
        }
    }, [daysWorked, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload: any = {
            vsla_id: vslaId,
            type,
            amount: Number(amount),
            description
        };

        if (['savings', 'loan_disbursement', 'loan_repayment', 'stipend'].includes(type)) {
            payload.member_id = Number(memberId);
        }

        if (type === 'loan_disbursement') {
            payload.repayment_date = repaymentDate;
            payload.interest_rate = interestRate;
        }

        if (type === 'stipend') {
            payload.work_type = workType;
            payload.days_worked = daysWorked;
        }

        if (type === 'maintenance_expense') {
            payload.vendor_name = vendorName;
        }

        if (type === 'input_repayment') {
            payload.sale_reference = saleReference;
        }

        try {
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Record New Transaction</h2>
                        <p className="text-sm text-gray-500">Select transaction type and enter details</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Transaction Types Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'savings', label: 'Savings Deposit', color: 'green', icon: '💰' },
                            { id: 'loan_disbursement', label: 'Loan Disbursement', color: 'orange', icon: '💸' },
                            { id: 'loan_repayment', label: 'Loan Repayment', color: 'blue', icon: '💳' },
                            { id: 'stipend', label: 'Stipend Payment', color: 'yellow', icon: '👷' },
                            { id: 'maintenance_expense', label: 'Maintenance', color: 'gray', icon: '🔧' },
                            { id: 'input_repayment', label: 'Input Repayment', color: 'slate', icon: '🌾' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setType(t.id as TransactionType)}
                                className={`
                                    flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                                    ${type === t.id
                                        ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700 shadow-md transform scale-105`
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600'}
                                `}
                            >
                                <span className="text-2xl mb-2">{t.icon}</span>
                                <span className="text-xs font-semibold text-center">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {/* Member Selection for specific types */}
                        {['savings', 'loan_disbursement', 'loan_repayment', 'stipend'].includes(type) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Member *</label>
                                <select
                                    required
                                    value={memberId}
                                    onChange={(e) => setMemberId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                >
                                    <option value="">-- Choose Member --</option>
                                    {members.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Loan Disbursement Fields */}
                        {type === 'loan_disbursement' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={repaymentDate}
                                        onChange={(e) => setRepaymentDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stipend Fields */}
                        {type === 'stipend' && (
                            <div className="grid grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                                    <select
                                        value={workType}
                                        onChange={(e) => setWorkType(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border-gray-200"
                                    >
                                        <option>Compost Production</option>
                                        <option>Childcare</option>
                                        <option>Training Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Days Worked</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        value={daysWorked}
                                        onChange={(e) => setDaysWorked(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border-gray-200"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Maintenance Fields */}
                        {type === 'maintenance_expense' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                    placeholder="e.g., Hardware Store Ltd"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-500"
                                />
                            </div>
                        )}

                        {/* Common Amount Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RWF) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-gray-400 font-semibold">RWF</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 font-mono text-lg font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Common Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter any additional details..."
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all transform active:scale-95
                                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}
                            `}
                        >
                            {isLoading ? 'Processing...' : 'Record Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionFormModal;
