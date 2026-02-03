import React, { useState, useEffect } from 'react';
import ModalLayout from '../ModalLayout';
import { apiGet, apiPost } from '../../utils/api';

interface Worker {
    id: number;
    full_name: string;
    phone?: string;
}

interface LaborAssignmentModalProps {
    batchId: string | null;
    batchNumber: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const LaborAssignmentModal: React.FC<LaborAssignmentModalProps> = ({
    batchId,
    batchNumber,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [dateWorked, setDateWorked] = useState(new Date().toISOString().split('T')[0]);
    const [hoursWorked, setHoursWorked] = useState('8');
    const [tasks, setTasks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchWorkers();
        }
    }, [isOpen]);

    const fetchWorkers = async () => {
        try {
            // Fetch farmers who can work as casual laborers
            const data = await apiGet<any>('/farmers');
            setWorkers(data.farmers || data || []);
        } catch (err: any) {
            console.error('Failed to fetch workers:', err);
            setError('Failed to load workers');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await apiPost('/compost/workdays', {
                worker_id: parseInt(selectedWorkerId),
                batch_id: parseInt(batchId),
                date_worked: dateWorked,
                hours_worked: parseFloat(hoursWorked),
                daily_wage: 3000,
                payment_status: 'pending'
            });

            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to assign worker');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedWorkerId('');
        setDateWorked(new Date().toISOString().split('T')[0]);
        setHoursWorked('8');
        setTasks('');
        setError(null);
    };

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Labor - ${batchNumber}`}
            size="md"
            footer={
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedWorkerId}
                        className="px-6 py-2 bg-[#00A1DE] text-white rounded-md text-sm font-medium hover:bg-[#0081b4] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign Worker'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Worker Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Worker *
                    </label>
                    <select
                        required
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                    >
                        <option value="">-- Select a worker --</option>
                        {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                                {worker.full_name} {worker.phone ? `(${worker.phone})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Worked */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Worked *
                    </label>
                    <input
                        type="date"
                        required
                        value={dateWorked}
                        onChange={(e) => setDateWorked(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                    />
                </div>

                {/* Hours Worked */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Worked *
                    </label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="12"
                        step="0.5"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A1DE] focus:border-[#00A1DE]"
                    />
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">💰 Payment Information</h5>
                    <p className="text-sm text-blue-700">
                        Daily Wage: <span className="font-medium">RWF 3,000</span>
                    </p>
                    <p className="text-sm text-blue-700">
                        Status: <span className="font-medium">Pending Payment</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                        Quality bonus (+10%) will be calculated when batch is tested
                    </p>
                </div>
            </form>
        </ModalLayout>
    );
};

export default LaborAssignmentModal;
