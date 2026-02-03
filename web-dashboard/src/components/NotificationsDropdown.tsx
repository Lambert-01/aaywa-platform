import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const NotificationsDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mock notifications
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'warning',
            title: 'Missing Reports',
            message: '2 VSLA groups missed weekly meeting report.',
            time: '10 min ago',
            read: false
        },
        {
            id: '2',
            type: 'info',
            title: 'New User',
            message: 'Jean Claude (Agronomist) joined the platform.',
            time: '1 hour ago',
            read: false
        },
        {
            id: '3',
            type: 'success',
            title: 'Training Complete',
            message: 'Compost training for Cohort 1 marked as complete.',
            time: '2 hours ago',
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
            case 'success': return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
            default: return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500/50"
            >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-brand-blue-600 hover:text-brand-blue-700 font-medium">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-brand-blue-50/10' : ''}`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
                                                <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-blue-500"></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                        <a href="/notifications" className="text-xs font-medium text-brand-blue-600 hover:text-brand-blue-700">
                            View all
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
