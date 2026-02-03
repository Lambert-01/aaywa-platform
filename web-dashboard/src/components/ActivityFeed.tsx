import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    BanknotesIcon,
    UserGroupIcon,
    ArchiveBoxIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Activity {
    type: string;
    description: string;
    timestamp: string;
    related_id: number;
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/activity`, {
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
            case 'training': return <AcademicCapIcon className="h-5 w-5 text-purple-500" />;
            case 'compost': return <ArchiveBoxIcon className="h-5 w-5 text-green-500" />;
            case 'sale': return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
            default: return <UserGroupIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'training': return 'bg-purple-100';
            case 'compost': return 'bg-green-100';
            case 'sale': return 'bg-blue-100';
            default: return 'bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    • Live
                </span>
            </div>
            {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
                <div className="flow-root">
                    <ul className="-mb-8">
                        {activities.map((activity, activityIdx) => (
                            <li key={activityIdx}>
                                <div className="relative pb-8">
                                    {activityIdx !== activities.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getBgColor(activity.type)}`}>
                                                {getIcon(activity.type)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-700">{activity.description}</p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                                <time dateTime={activity.timestamp}>
                                                    {formatDistanceToNow(new Date(activity.timestamp))} ago
                                                </time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
