import React from 'react';
import { safeFormatDate } from '../../utils/formatters';

interface CompostProductionTimelineProps {
    startDate: string;
    maturityDate: string;
    status: string;
    qualityScore?: number | null;
}

const CompostProductionTimeline: React.FC<CompostProductionTimelineProps> = ({
    startDate,
    maturityDate,
    status,
    qualityScore
}) => {
    // Calculate progress
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    // Calculate days remaining
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    // Milestones
    const milestones = [
        { label: 'Start', date: startDate, percentage: 0, icon: '🌱', color: 'bg-green-500' },
        { label: 'Mixing', date: '', percentage: 15, icon: '🔄', color: 'bg-blue-500' },
        { label: 'Curing', date: '', percentage: 50, icon: '🌡️', color: 'bg-amber-500' },
        { label: 'Mature', date: maturityDate, percentage: 100, icon: '✅', color: 'bg-emerald-500' }
    ];

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Production Progress</h4>
                    <span className="text-sm text-gray-600">
                        {progress.toFixed(0)}% Complete
                        {daysRemaining > 0 && ` • ${daysRemaining} days remaining`}
                        {daysRemaining <= 0 && status === 'Mature' && ' • Ready!'}
                    </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00A1DE] to-[#FFD700] transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300" />

                {/* Milestones */}
                <div className="relative flex justify-between">
                    {milestones.map((milestone, index) => {
                        const isPassed = progress >= milestone.percentage;
                        const isActive = progress >= milestone.percentage - 5 && progress < milestone.percentage + 5;

                        return (
                            <div key={index} className="flex flex-col items-center" style={{ zIndex: 10 }}>
                                {/* Icon Circle */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                                    transition-all duration-300 shadow-md
                                    ${isPassed ? milestone.color : 'bg-gray-300'}
                                    ${isActive ? 'ring-4 ring-offset-2 ring-[#00A1DE]' : ''}
                                `}>
                                    {milestone.icon}
                                </div>

                                {/* Label */}
                                <p className={`mt-2 text-xs font-medium ${isPassed ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {milestone.label}
                                </p>

                                {/* Date */}
                                {milestone.date && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {safeFormatDate(milestone.date)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
                <div className={`
                    px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center
                    ${status === 'Mature' ? 'bg-green-100 text-green-800' : ''}
                    ${status === 'Curing' ? 'bg-amber-100 text-amber-800' : ''}
                    ${status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                    ${status === 'Sold' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                    <span className="mr-2">
                        {status === 'Mature' && '✅'}
                        {status === 'Curing' && '🌡️'}
                        {status === 'In Progress' && '🔄'}
                        {status === 'Sold' && '💰'}
                    </span>
                    Status: {status}
                    {qualityScore && ` (Quality: ${qualityScore}/10)`}
                </div>
            </div>

            {/* Key Activities (Optional) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">📋 Key Activities</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Temperature monitoring (daily)</li>
                    <li>• Pile turning (every 3-4 days)</li>
                    <li>• Moisture checks (weekly)</li>
                    <li>• Quality testing (at maturity)</li>
                </ul>
            </div>
        </div>
    );
};

export default CompostProductionTimeline;
