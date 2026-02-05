import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { apiGet, apiPatch } from '../../utils/api';
import AlertBanner from './AlertBanner';

interface Alert {
    id: number;
    alert_type: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action_url?: string;
    entity_name?: string;
    threshold_value?: number;
    actual_value?: number;
    created_at: string;
}

const NotificationCenter: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAlerts();
        // Poll for new alerts every 60 seconds
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await apiGet<{ alerts: Alert[] }>('/api/alerts');
            setAlerts(data.alerts || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id: number) => {
        try {
            await apiPatch(`/api/alerts/${id}/dismiss`, {});
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        }
    };

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;
    const hasCritical = criticalCount > 0;

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-rwanda-blue-600 hover:bg-rwanda-blue-50 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                {hasCritical ? (
                    <BellAlertIcon className="h-6 w-6 text-red-600 animate-bounce" />
                ) : (
                    <BellIcon className="h-6 w-6" />
                )}

                {/* Badge */}
                {alerts.length > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full ${hasCritical ? 'bg-red-600' : 'bg-amber-500'
                        }`}>
                        {alerts.length > 9 ? '9+' : alerts.length}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-lg shadow-soft-lg border border-gray-100 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                <p className="text-xs text-gray-500">
                                    {alerts.length === 0 ? 'All clear!' : `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Alert Summary */}
                        {alerts.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs">
                                {criticalCount > 0 && (
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-red-600 rounded-full" />
                                        <span className="text-gray-600">{criticalCount} Critical</span>
                                    </div>
                                )}
                                {warningCount > 0 && (
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                        <span className="text-gray-600">{warningCount} Warning</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alert List */}
                        <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-100">
                            {loading && alerts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin h-8 w-8 border-2 border-rwanda-blue-500 border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-gray-500 mt-2">Loading alerts...</p>
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">No active alerts</p>
                                    <p className="text-xs text-gray-400 mt-1">System is running smoothly</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className="p-3 hover:bg-gray-50 transition-colors">
                                            <AlertBanner
                                                alert={alert}
                                                onDismiss={(id) => {
                                                    handleDismiss(id);
                                                    if (alerts.length === 1) setIsOpen(false);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {alerts.length > 0 && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        // Dismiss all
                                        alerts.forEach(alert => handleDismiss(alert.id));
                                        setIsOpen(false);
                                    }}
                                    className="text-xs text-rwanda-blue-600 hover:text-rwanda-blue-700 font-medium"
                                >
                                    Dismiss all
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
