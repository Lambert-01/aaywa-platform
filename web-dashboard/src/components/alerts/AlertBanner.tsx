import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, FireIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

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

interface AlertBannerProps {
    alert: Alert;
    onDismiss: (id: number) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
    const navigate = useNavigate();

    const severityConfig = {
        critical: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            icon: FireIcon,
            buttonHover: 'hover:bg-red-100',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-900',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            icon: ExclamationTriangleIcon,
            buttonHover: 'hover:bg-amber-100',
        },
        info: {
            bg: 'bg-rwanda-blue-50',
            border: 'border-rwanda-blue-200',
            text: 'text-rwanda-blue-900',
            iconBg: 'bg-rwanda-blue-100',
            iconColor: 'text-rwanda-blue-600',
            icon: InformationCircleIcon,
            buttonHover: 'hover:bg-rwanda-blue-100',
        },
        success: {
            bg: 'bg-brand-green-50',
            border: 'border-brand-green-200',
            text: 'text-brand-green-900',
            iconBg: 'bg-brand-green-100',
            iconColor: 'text-brand-green-600',
            icon: CheckCircleIcon,
            buttonHover: 'hover:bg-brand-green-100',
        },
    };

    const config = severityConfig[alert.severity];
    const Icon = config.icon;

    const handleAction = () => {
        if (alert.action_url) {
            navigate(alert.action_url);
            onDismiss(alert.id);
        }
    };

    return (
        <div className={`${config.bg} ${config.border} border rounded-lg p-4 shadow-soft`}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`${config.iconBg} rounded-lg p-2 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className={`text-sm font-semibold ${config.text}`}>
                                {alert.title}
                            </h4>
                            <p className={`text-sm ${config.text} mt-1 opacity-90`}>
                                {alert.message}
                            </p>

                            {/* Metrics */}
                            {alert.threshold_value && alert.actual_value && (
                                <div className="mt-2 flex items-center gap-4 text-xs">
                                    <span className={`${config.text} opacity-75`}>
                                        Threshold: <span className="font-medium">{alert.threshold_value}%</span>
                                    </span>
                                    <span className={`${config.text} opacity-75`}>
                                        Current: <span className="font-semibold">{alert.actual_value.toFixed(1)}%</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {alert.action_url && (
                                <button
                                    onClick={handleAction}
                                    className={`px-3 py-1.5 text-xs font-medium ${config.text} ${config.buttonHover} rounded-md transition-colors`}
                                >
                                    View Details →
                                </button>
                            )}
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className={`p-1.5 ${config.buttonHover} rounded-md transition-colors`}
                                aria-label="Dismiss alert"
                            >
                                <XMarkIcon className={`h-4 w-4 ${config.text}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertBanner;
