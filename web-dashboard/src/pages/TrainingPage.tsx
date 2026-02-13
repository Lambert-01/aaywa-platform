import React, { useState, useEffect } from 'react';
import {
    AcademicCapIcon,
    CalendarIcon,
    UserGroupIcon,
    FolderIcon,
    ChartBarIcon,
    PlusIcon,
    BellIcon,
    ArrowDownTrayIcon,
    BookOpenIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { apiGet, apiPost } from '../utils/api';
import TrainingCalendar from '../components/training/TrainingCalendar';
import SessionDetailModal from '../components/training/SessionDetailModal';
import SessionsTable from '../components/training/SessionsTable';
import ParticipantPerformanceTable from '../components/training/ParticipantPerformanceTable';
import LearningMaterialsLibrary from '../components/training/LearningMaterialsLibrary';
import TrainingAnalyticsDashboard from '../components/training/TrainingAnalyticsDashboard';
import SMSReminderModal from '../components/training/SMSReminderModal';
import ScheduleSessionModal from '../components/training/ScheduleSessionModal';
import ModuleBuilderModal from '../components/training/ModuleBuilderModal';
import QuizBuilderModal from '../components/training/QuizBuilderModal';

const TrainingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('calendar');
    const [sessions, setSessions] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);

    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showSMSModal, setShowSMSModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);

    useEffect(() => {
        fetchTrainingData();
    }, []);

    const fetchTrainingData = async () => {
        try {
            setLoading(true);

            // Fetch all training data in parallel
            const [sessionsData, participantsData, materialsData, statsData, quizzesData] = await Promise.all([
                apiGet('/api/training/sessions'),
                apiGet('/api/training/participants'),
                apiGet('/api/training/materials'),
                apiGet('/api/training/stats'),
                apiGet('/api/training/quizzes')
            ]);

            setSessions(sessionsData as any[]);
            setParticipants(participantsData as any[]);
            setMaterials(materialsData as any[]);
            setStats(statsData as any);
            setQuizzes(quizzesData as any[]);
            setModules(materialsData as any[]); // Using materials as modules for now
        } catch (err: any) {
            console.error('Error fetching training data:', err);
            setError('Failed to load training data');
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = (session: any) => {
        setSelectedSession(session);
    };

    const handleMaterialDownload = async (materialId: number) => {
        try {
            await apiGet(`/api/training/materials/${materialId}/download`);
            // Refresh materials to update download count
            const updatedMaterials = await apiGet('/api/training/materials');
            setMaterials(updatedMaterials as any[]);
        } catch (err) {
            console.error('Error downloading material:', err);
        }
    };

    const handleExportReport = () => {
        // Generate CSV export
        const csvData = [
            ['Session Title', 'Type', 'Date', 'Attendance Rate', 'Status'],
            ...sessions.map(s => [
                s.title,
                s.session_type,
                new Date(s.date).toLocaleDateString(),
                s.attendance_rate ? `${s.attendance_rate}%` : 'N/A',
                s.status
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `training-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleScheduleSession = async (sessionData: any) => {
        try {
            await apiPost('/api/training/sessions', sessionData);
            await fetchTrainingData(); // Refresh data
        } catch (err) {
            console.error('Error scheduling session:', err);
        }
    };

    const handleSaveModule = async (moduleData: any) => {
        try {
            await apiPost('/api/training/modules', moduleData);
            // TODO: Fetch modules
        } catch (err) {
            console.error('Error saving module:', err);
        }
    };

    const handleSaveQuiz = async (quizData: any) => {
        try {
            await apiPost('/api/training/quizzes', quizData);
            // TODO: Fetch quizzes
        } catch (err) {
            console.error('Error saving quiz:', err);
        }
    };

    const tabs = [
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        { id: 'sessions', label: 'Sessions', icon: AcademicCapIcon },
        { id: 'participants', label: 'Participants', icon: UserGroupIcon },
        { id: 'materials', label: 'Materials', icon: FolderIcon },
        { id: 'modules', label: 'Modules', icon: BookOpenIcon },
        { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A1DE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Training Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <div className="text-red-600 text-center">
                        <p className="text-lg font-semibold">Error Loading Data</p>
                        <p className="mt-2 text-sm">{error}</p>
                        <button
                            onClick={fetchTrainingData}
                            className="mt-4 px-6 py-2 bg-[#00A1DE] text-white rounded-lg hover:bg-[#0081BE] transition-all"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-[#00A1DE] via-blue-600 to-indigo-600 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                                    <AcademicCapIcon className="h-8 w-8 text-white" />
                                </div>
                                <span>Training Management</span>
                            </h1>
                            <p className="mt-2 text-blue-100 max-w-2xl">
                                Cascade training model ensuring 100% participant inclusion across all platforms
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowSMSModal(true)}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all backdrop-blur-sm shadow-lg"
                            >
                                <BellIcon className="h-5 w-5" />
                                <span className="font-medium">Send SMS Reminders</span>
                            </button>
                            <button
                                onClick={handleExportReport}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all backdrop-blur-sm shadow-lg"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span className="font-medium">Export Report</span>
                            </button>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all shadow-lg"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span className="font-medium">Schedule Session</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Banner */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Sessions', value: stats?.total_sessions || 0, color: 'from-blue-400 to-blue-500' },
                            { label: 'Attendance Rate', value: `${Number(stats?.avg_attendance_rate || 0).toFixed(1)}%`, color: 'from-green-400 to-emerald-500' },
                            { label: 'Champions Active', value: stats?.champions_trained || 0, color: 'from-purple-400 to-pink-500' },
                            { label: 'Childcare Support', value: stats?.childcare_provided_count || 0, color: 'from-amber-400 to-orange-500' }
                        ].map((kpi, idx) => (
                            <div key={idx} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg hover:bg-opacity-20 transition-all">
                                <div className="text-blue-100 text-sm font-medium">{kpi.label}</div>
                                <div className={`text-3xl font-bold bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}>
                                    {kpi.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-all whitespace-nowrap ${isActive
                                        ? 'border-[#00A1DE] text-[#00A1DE] bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'calendar' && (
                    <div className="animate-fadeIn">
                        <TrainingCalendar sessions={sessions} onSessionClick={handleSessionClick} />
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="animate-fadeIn">
                        <SessionsTable sessions={sessions} onViewSession={handleSessionClick} />
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="animate-fadeIn">
                        <ParticipantPerformanceTable participants={participants} />
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="animate-fadeIn">
                        <LearningMaterialsLibrary
                            materials={materials}
                            onDownload={handleMaterialDownload}
                        />
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div className="animate-fadeIn space-y-6">
                        {/* Module Header */}
                        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Training Modules</h2>
                                <p className="text-gray-600 mt-1">Create and manage comprehensive training curricula</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowQuizModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all shadow-lg"
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    <span className="font-medium">Create Quiz</span>
                                </button>
                                <button
                                    onClick={() => setShowModuleModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all shadow-lg"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span className="font-medium">Create Module</span>
                                </button>
                            </div>
                        </div>

                        {/* Modules List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.length === 0 ? (
                                <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                                    <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg font-medium">No modules created yet</p>
                                    <p className="text-gray-500 mt-2">Create your first training module to get started</p>
                                    <button
                                        onClick={() => setShowModuleModal(true)}
                                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all"
                                    >
                                        Create Module
                                    </button>
                                </div>
                            ) : (
                                modules.map((module, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all">
                                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                                        <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-fadeIn">
                        <TrainingAnalyticsDashboard stats={stats} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <SessionDetailModal
                session={selectedSession}
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />
            <SMSReminderModal
                isOpen={showSMSModal}
                onClose={() => setShowSMSModal(false)}
                sessions={sessions}
            />
            <ScheduleSessionModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleScheduleSession}
            />
            <ModuleBuilderModal
                isOpen={showModuleModal}
                onClose={() => setShowModuleModal(false)}
                onSave={handleSaveModule}
            />
            <QuizBuilderModal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                onSave={handleSaveQuiz}
            />
        </div>
    );
};

export default TrainingPage;
