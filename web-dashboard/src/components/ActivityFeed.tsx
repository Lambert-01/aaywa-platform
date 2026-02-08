import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    BanknotesIcon,
    UserGroupIcon,
    ArchiveBoxIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../api/config';

interface Activity {
    type: string;
    description: string;
    timestamp: string;
    related_id: number;
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // Display only 5 activities by default
    const displayedActivities = showAll ? activities : activities.slice(0, 5);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/dashboard/activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Failed to fetch activity feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'training': return <AcademicCapIcon className="h-5 w-5 text-purple-600" />;
            case 'compost': return <ArchiveBoxIcon className="h-5 w-5 text-emerald-600" />;
            case 'sale': return <BanknotesIcon className="h-5 w-5 text-blue-600" />;
            default: return <UserGroupIcon className="h-5 w-5 text-gray-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'training': return 'bg-purple-100 border border-purple-200';
            case 'compost': return 'bg-emerald-100 border border-emerald-200';
            case 'sale': return 'bg-blue-100 border border-blue-200';
            default: return 'bg-gray-100 border border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserGroupIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">Activity will appear here as it happens</p>
                </div>
            ) : (
                <>
                    <div className="flow-root">
                        <ul className="space-y-0">
                            {displayedActivities.map((activity, activityIdx) => (
                                <li key={activityIdx} className="group hover:bg-gray-50/50 transition-colors duration-150 rounded-lg -mx-2 px-2">
                                    <div className="relative py-4">
                                        {activityIdx !== displayedActivities.length - 1 ? (
                                            <span className="absolute top-10 left-6 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-200 to-transparent" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-4">
                                            <div className="flex-shrink-0">
                                                <span className={`h-10 w-10 rounded-xl flex items-center justify-center ring-4 ring-white shadow-sm ${getBgColor(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
                                                    {getIcon(activity.type)}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                                        {activity.description}
                                                    </p>
                                                    <div className="text-right text-xs whitespace-nowrap text-gray-500 font-medium">
                                                        <time dateTime={activity.timestamp}>
                                                            {formatDistanceToNow(new Date(activity.timestamp))} ago
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pagination Controls */}
                    {activities.length > 5 && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{displayedActivities.length}</span> of <span className="font-semibold text-gray-900">{activities.length}</span> activities
                                </p>
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-blue-600 bg-brand-blue-50 hover:bg-brand-blue-100 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow"
                                >
                                    {showAll ? (
                                        <>
                                            Show Less
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            View All
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityFeed;
