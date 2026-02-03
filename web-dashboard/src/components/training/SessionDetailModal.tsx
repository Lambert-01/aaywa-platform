import React from 'react';
import ModalLayout from '../ModalLayout';
import { safeFormatDate } from '../../utils/formatters';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserGroupIcon,
    DocumentTextIcon,
    HeartIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SessionDetailModalProps {
    session: any;
    isOpen: boolean;
    onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, isOpen, onClose }) => {
    if (!session) return null;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const materials = session.materials ? (typeof session.materials === 'string' ? JSON.parse(session.materials) : session.materials) : [];

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={session.title}
            size="xl"
            footer={
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 bg-[#00A1DE] text-white rounded-md text-sm font-medium hover:bg-[#0089bf]">
                        Edit Session
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Session Type Badge */}
                <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${session.session_type === 'Master Training' ? 'bg-green-100 text-green-800' :
                            session.session_type === 'Champion Training' ? 'bg-blue-100 text-blue-800' :
                                session.session_type === 'VSLA' ? 'bg-purple-100 text-purple-800' :
                                    session.session_type === 'Nutrition' ? 'bg-pink-100 text-pink-800' :
                                        'bg-emerald-100 text-emerald-800'
                        }`}>
                        {session.session_type}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${session.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {session.status}
                    </span>
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date</p>
                            <p className="text-sm text-gray-900">{safeFormatDate(session.date)}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Time & Duration</p>
                            <p className="text-sm text-gray-900">
                                {formatTime(session.date)} ({session.duration_hours || 2} hours)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Location</p>
                            <p className="text-sm text-gray-900">{session.location}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trainer</p>
                            <p className="text-sm text-gray-900">{session.trainer_name || 'TBD'}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Cohort</p>
                            <p className="text-sm text-gray-900">{session.cohort_name || `Cohort ${session.cohort_id}`}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <HeartIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Childcare</p>
                            <p className="text-sm text-gray-900">
                                {session.childcare_provided ? '✅ Provided' : '❌ Not Provided'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attendance Section */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium">Expected</p>
                            <p className="text-2xl font-bold text-blue-900">{session.expected_attendees || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-600 font-medium">Actual</p>
                            <p className="text-2xl font-bold text-green-900">{session.actual_attendees || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-purple-600 font-medium">Rate</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {session.expected_attendees > 0
                                    ? Math.round((session.actual_attendees / session.expected_attendees) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Materials Section */}
                {materials && materials.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <h4 className="text-sm font-medium text-gray-900">Materials Used</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {materials.map((material: string, index: number) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                    {material}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes Section */}
                {session.notes && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{session.notes}</p>
                    </div>
                )}

                {/* Feedback Section */}
                {session.avg_feedback && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Average Feedback Score</h4>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#FFD700] h-2 rounded-full"
                                    style={{ width: `${(session.avg_feedback / 5) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {Number(session.avg_feedback).toFixed(1)} / 5.0
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </ModalLayout>
    );
};

export default SessionDetailModal;
