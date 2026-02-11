import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TruckIcon,
    AcademicCapIcon,
    ScissorsIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface Event {
    id: number;
    title: string;
    type: 'delivery' | 'training' | 'harvest' | 'compost';
    date: string;
    location: string;
}

const UpcomingEvents = ({ events }: { events: Event[] }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? fr : enUS;

    // Sort events by date if not already sorted
    const sortedEvents = [...(events || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getIcon = (type: string) => {
        switch (type) {
            case 'delivery': return <TruckIcon className="w-5 h-5 text-blue-500" />;
            case 'training': return <AcademicCapIcon className="w-5 h-5 text-purple-500" />;
            case 'harvest': return <ScissorsIcon className="w-5 h-5 text-green-500" />;
            case 'compost': return <BeakerIcon className="w-5 h-5 text-amber-500" />;
            default: return null;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'delivery': return 'bg-blue-50';
            case 'training': return 'bg-purple-50';
            case 'harvest': return 'bg-green-50';
            case 'compost': return 'bg-amber-50';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span>{t('dashboard.upcoming_events_title')}</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{t('dashboard.next_7_days')}</span>
            </h3>
            <div className="space-y-4">
                {sortedEvents.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 text-sm">{t('dashboard.no_events')}</p>
                ) : (
                    sortedEvents.map((event) => (
                        <div key={event.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
                            <div className={`p-2 rounded-lg ${getBgColor(event.type)}`}>
                                {getIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{event.title}</p>
                                <p className="text-xs text-slate-500">{event.location}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-700">
                                    {format(new Date(event.date), 'MMM d', { locale })}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {format(new Date(event.date), 'h:mm a', { locale })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-brand-blue-600 font-medium hover:bg-brand-blue-50 rounded-lg transition-colors">
                {t('dashboard.view_calendar')}
            </button>
        </div>
    );
};

export default UpcomingEvents;
