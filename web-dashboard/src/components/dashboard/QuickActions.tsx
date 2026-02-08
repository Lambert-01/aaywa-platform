import React from 'react';
import {
    UserPlusIcon,
    CalendarDaysIcon,
    BeakerIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Add New Farmer',
            icon: <UserPlusIcon className="w-8 h-8 text-white" />,
            color: 'bg-green-500',
            path: '/farmers/new',
            role: 'all'
        },
        {
            title: 'Schedule Training',
            icon: <CalendarDaysIcon className="w-8 h-8 text-white" />,
            color: 'bg-blue-500',
            path: '/training/schedule',
            role: 'all'
        },
        {
            title: 'Create Compost Batch',
            icon: <BeakerIcon className="w-8 h-8 text-white" />,
            color: 'bg-amber-500',
            path: '/compost/new',
            role: 'all'
        },
        {
            title: 'Record Sale',
            icon: <BanknotesIcon className="w-8 h-8 text-white" />,
            color: 'bg-purple-500',
            path: '/sales/new',
            role: 'all'
        },
        {
            title: 'View Orders',
            icon: <ShoppingCartIcon className="w-8 h-8 text-white" />,
            color: 'bg-indigo-500',
            path: '/market-access',
            role: 'all'
        },
    ];

    if (user?.role === 'project_manager') {
        actions.push({
            title: 'Manage Users',
            icon: <UsersIcon className="w-8 h-8 text-white" />,
            color: 'bg-slate-700',
            path: '/users',
            role: 'project_manager'
        });
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:scale-105 group"
                >
                    <div className={`${action.color} p-4 rounded-xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        {action.icon}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm text-center">{action.title}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
