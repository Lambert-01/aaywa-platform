import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TrainingSession {
    id: string | number;
    title: string;
    session_type: string;
    date: string;
    cohort_name?: string;
    trainer_name?: string;
    childcare_provided?: boolean;
    expected_attendees?: number;
}

interface TrainingCalendarProps {
    sessions: TrainingSession[];
    onSessionClick: (session: TrainingSession) => void;
}

const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ sessions, onSessionClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const sessionTypeColors: Record<string, { bg: string; text: string; border: string }> = {
        'Master Training': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
        'Champion Training': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
        'VSLA': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
        'Nutrition': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-500' },
        'Agronomy': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-500' }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getSessionsForDate = (date: Date) => {
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.getDate() === date.getDate() &&
                sessionDate.getMonth() === date.getMonth() &&
                sessionDate.getFullYear() === date.getFullYear();
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const calendarDays = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
                {Object.entries(sessionTypeColors).map(([type, colors]) => (
                    <div key={type} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${colors.bg} border-2 ${colors.border}`} />
                        <span className="text-xs text-gray-600">{type}</span>
                    </div>
                ))}
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateObj = new Date(year, month, day);
                    const daySessions = getSessionsForDate(dateObj);
                    const isToday = dateObj.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={day}
                            className={`aspect-square border rounded-lg p-1 ${isToday ? 'border-[#00A1DE] bg-blue-50' : 'border-gray-200'
                                } hover:shadow-md transition-shadow`}
                        >
                            <div className="h-full flex flex-col">
                                <span className={`text-sm font-medium ${isToday ? 'text-[#00A1DE]' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                                    {daySessions.slice(0, 3).map(session => {
                                        const colors = sessionTypeColors[session.session_type] || sessionTypeColors['Agronomy'];
                                        return (
                                            <button
                                                key={session.id}
                                                onClick={() => onSessionClick(session)}
                                                className={`w-full text-left px-1 py-0.5 rounded text-xs ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity truncate`}
                                                title={`${session.title} - ${session.cohort_name || ''}`}
                                            >
                                                {session.title.substring(0, 15)}...
                                            </button>
                                        );
                                    })}
                                    {daySessions.length > 3 && (
                                        <div className="text-xs text-gray-500 text-center">
                                            +{daySessions.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrainingCalendar;
