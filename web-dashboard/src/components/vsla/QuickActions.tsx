import React, { useState } from 'react';
import MemberStatementsModal from './MemberStatementsModal';
import EmailSummaryModal from './EmailSummaryModal';
import VSLASettingsModal from './VSLASettingsModal';

interface QuickActionsProps {
    vslaId: number;
    vslaName: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ vslaId, vslaName }) => {
    const [isStatementsOpen, setIsStatementsOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                    <button
                        onClick={() => setIsStatementsOpen(true)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors flex items-center shadow-sm hover:shadow"
                    >
                        <span className="mr-2">📄</span> Generate Member Statements
                    </button>

                    <button
                        onClick={() => setIsEmailOpen(true)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors flex items-center shadow-sm hover:shadow"
                    >
                        <span className="mr-2">📧</span> Email Weekly Summary
                    </button>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors flex items-center shadow-sm hover:shadow"
                    >
                        <span className="mr-2">⚙️</span> VSLA Settings
                    </button>
                </div>
            </div>

            {/* Modals */}
            <MemberStatementsModal
                isOpen={isStatementsOpen}
                onClose={() => setIsStatementsOpen(false)}
                vslaId={vslaId}
            />

            <EmailSummaryModal
                isOpen={isEmailOpen}
                onClose={() => setIsEmailOpen(false)}
                vslaId={vslaId}
                vslaName={vslaName}
            />

            <VSLASettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                vslaId={vslaId}
            />
        </>
    );
};

export default QuickActions;
