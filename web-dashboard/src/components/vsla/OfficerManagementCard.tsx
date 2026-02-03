import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface Officer {
    id: number;
    full_name: string;
    role: string;
    phone: string;
}

const OfficerManagementCard: React.FC<{ officers: Officer[] }> = ({ officers }) => {
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'chair': return 'Chairperson';
            case 'treasurer': return 'Treasurer';
            case 'secretary': return 'Secretary';
            case 'loan_officer': return 'Loan Officer';
            default: return role;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Current Officers</h3>
                <button className="text-sm text-brand-blue-600 hover:text-brand-blue-800 font-medium">Rotate Leadership</button>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {officers.map(officer => (
                        <div key={officer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-white p-2 rounded-full border border-gray-200">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{officer.full_name}</p>
                                <p className="text-xs text-brand-blue-600 font-semibold uppercase">{getRoleLabel(officer.role)}</p>
                                <p className="text-xs text-gray-500">{officer.phone}</p>
                            </div>
                        </div>
                    ))}
                    {officers.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No officers assigned yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfficerManagementCard;
