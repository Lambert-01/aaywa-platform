import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'amber' | 'emerald' | 'indigo' | 'teal' | 'cyan';
    children?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    subtitle,
    trend,
    color = 'blue',
    children
}) => {
    const { t } = useTranslation();

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
        purple: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
        red: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    };

    const theme = colorMap[color];

    return (
        <div className="card-premium group relative overflow-hidden p-6 hover:-translate-y-1 transition-transform duration-300">
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bg.replace('bg-', 'bg-').replace('50', '500')}`} />

            <div className="flex items-start justify-between">
                <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {value}
                        </h3>
                    </div>
                </div>

                <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} bg-opacity-60 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-6 h-6">
                        {icon}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend.isPositive ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1.5" />
                        ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1.5" />
                        )}
                        <span>{Math.abs(trend.value)}%</span>
                        <span className="ml-1.5 text-slate-400 font-normal text-xs">{t('common.vs_last_month')}</span>
                    </div>
                )}

                {subtitle && !trend && (
                    <p className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Decorative background blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${theme.bg} opacity-50 blur-2xl transition-opacity group-hover:opacity-70`} />


            {/* Trend or Children */}
            {(trend || children) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {children || (
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="text-green-600">↑ {trend?.value}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KPICard;
