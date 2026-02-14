import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    UserGroupIcon,
    HeartIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../api/config';
import KPICard from '../components/KPICard';
import ModalLayout from '../components/ModalLayout';
import StatusBadge from '../components/StatusBadge';
import FarmerDetails from '../components/farmers/FarmerDetails';
import FarmerForm from '../components/farmers/FarmerForm';
import { formatCurrency } from '../utils/formatters';

interface Farmer {
    id: number;
    full_name: string;
    phone: string;
    cohort_id: number;
    cohort_name: string;
    household_type: string;
    photo_url?: string;
    status: boolean;
    crops?: string;  // Changed from string[] to string (comma-separated)
    location_coordinates?: string;
    plot_size?: number;
    vsla_balance?: number;
    last_sale_amount?: number;
    location_address?: string;
    // ... other fields
}

const FarmersPage: React.FC = () => {
    const { t } = useTranslation();
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);

    // Filters
    const [cohortFilter, setCohortFilter] = useState('all');
    const [householdFilter, setHouseholdFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'champion' | 'teen_mother'>('all');

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/farmers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFarmers(data);
            }
        } catch (error) {
            console.error('Failed to fetch farmers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/farmers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsFormOpen(false);
                fetchFarmers();
            }
        } catch (error) {
            console.error('Create failed', error);
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingFarmer) return;
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/farmers/${editingFarmer.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                setIsFormOpen(false);
                setEditingFarmer(null);
                
                // Refresh farmers list to show updated data
                await fetchFarmers();
                
                // Update selected farmer if detail view is open
                if (selectedFarmer && selectedFarmer.id === editingFarmer.id) {
                    setSelectedFarmer(result.farmer);
                }
            }
        } catch (error) {
            console.error('Update failed', error);
        }
    };

    // Filter Logic
    const filteredFarmers = farmers.filter(farmer => {
        const matchesCohort = cohortFilter === 'all' || farmer.cohort_id.toString() === cohortFilter;
        const matchesHousehold = householdFilter === 'all' || farmer.household_type === householdFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? farmer.status : !farmer.status);
        const matchesSearch = farmer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            farmer.phone.includes(searchQuery);

        const matchesTab = activeTab === 'all' ||
            (activeTab === 'champion' && farmer.household_type === 'champion') ||
            (activeTab === 'teen_mother' && farmer.household_type === 'teen_mother');

        return matchesCohort && matchesHousehold && matchesStatus && matchesSearch && matchesTab;
    });

    // KPIs
    const totalFarmers = farmers.length;
    const champions = farmers.filter(f => f.household_type === 'champion').length;
    const teenMothers = farmers.filter(f => f.household_type === 'teen_mother').length;
    // Mock income for now if backend doesn't aggregate it, or calculate from list
    const avgIncome = farmers.length > 0 ?
        Math.round(farmers.reduce((sum, f) => sum + (f.last_sale_amount || 0), 0) / farmers.length) : 0;

    return (
        <div className="h-[calc(100vh-6rem)] overflow-hidden flex flex-col md:flex-row gap-6 p-6">

            {/* Column 1: KPIs & Quick Actions (Fixed Width) */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
                <button
                    onClick={() => { setEditingFarmer(null); setIsFormOpen(true); }}
                    className="w-full py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t('farmers.add_new')}
                </button>

                <div className="space-y-4">
                    <KPICard title={t('farmers.total')} value={totalFarmers} icon={<UsersIcon />} color="blue" />
                    <KPICard title={t('farmers.champions')} value={champions} icon={<UserGroupIcon />} color="purple" />
                    <KPICard title={t('farmers.teen_mothers')} value={teenMothers} icon={<HeartIcon />} color="red" />
                    <KPICard title={t('farmers.avg_income')} value={formatCurrency(avgIncome)} icon={<CurrencyDollarIcon />} color="green" />
                </div>
            </div>

            {/* Column 2: Filters & Table (Flexible) */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs Header */}
                <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-200 bg-white">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'all'
                            ? 'border-brand-blue-600 text-brand-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('farmers.all_tab')}
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {farmers.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('champion')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'champion'
                            ? 'border-brand-blue-600 text-brand-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        🏆 {t('farmers.champions')}
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {champions}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('teen_mother')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'teen_mother'
                            ? 'border-brand-blue-600 text-brand-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        ❤️ {t('farmers.teen_mothers')}
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {teenMothers}
                        </span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1 max-w-xs">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('farmers.search_placeholder')}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue-500/20 focus:border-brand-blue-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            value={cohortFilter}
                            onChange={e => setCohortFilter(e.target.value)}
                        >
                            <option value="all">{t('farmers.all_cohorts')}</option>
                            <option value="1">Cohort 1</option>
                            <option value="2">Cohort 2</option>
                            <option value="3">Cohort 3</option>
                            <option value="4">Cohort 4</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            value={householdFilter}
                            onChange={e => setHouseholdFilter(e.target.value)}
                        >
                            <option value="all">{t('farmers.all_households')}</option>
                            <option value="teen_mother">Teen Mother</option>
                            <option value="female_headed">Female Headed</option>
                            <option value="land_poor">Land Poor</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">{t('farmers.all_status')}</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_farmer')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_cohort')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_household')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_crops')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farmers.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t('farmers.loading')}</td></tr>
                            ) : filteredFarmers.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t('farmers.none_found')}</td></tr>
                            ) : (
                                filteredFarmers.map((farmer) => {
                                    // Parse location coordinates
                                    let locationDisplay = 'Not set';
                                    if (farmer.location_coordinates) {
                                        try {
                                            const coords = typeof farmer.location_coordinates === 'string' 
                                                ? JSON.parse(farmer.location_coordinates) 
                                                : farmer.location_coordinates;
                                            if (coords.lat && coords.lng) {
                                                locationDisplay = `${parseFloat(coords.lat).toFixed(4)}, ${parseFloat(coords.lng).toFixed(4)}`;
                                            }
                                        } catch (e) {
                                            locationDisplay = 'Invalid';
                                        }
                                    }
                                    
                                    return (
                                        <tr key={farmer.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                        src={farmer.photo_url ? 
                                                            (farmer.photo_url.startsWith('http') ? 
                                                                farmer.photo_url : 
                                                                `${API_URL}/${farmer.photo_url}`) : 
                                                            '/images/default-avatar.svg'
                                                        }
                                                        alt=""
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/images/default-avatar.svg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{farmer.full_name}</div>
                                                    <div className="text-sm text-gray-500">{farmer.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {farmer.cohort_name || `Cohort ${farmer.cohort_id}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {farmer.household_type?.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex gap-1">
                                                {farmer.crops?.split(',').slice(0, 2).map((c, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{c.trim()}</span>
                                                ))}
                                                {(farmer.crops?.split(',').length || 0) > 2 && <span className="text-xs text-gray-400">+{farmer.crops!.split(',').length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                            {locationDisplay}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={farmer.status ? 'Active' : 'Inactive'} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => { setSelectedFarmer(farmer); setIsDetailsOpen(true); }}
                                                className="text-brand-blue-600 hover:text-brand-blue-900 mr-3 font-semibold"
                                            >
                                                {t('common.view')}
                                            </button>
                                            <button
                                                onClick={() => { setEditingFarmer(farmer); setIsFormOpen(true); }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {t('common.edit')}
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between">
                    <span>{t('farmers.records_count', { count: filteredFarmers.length })}</span>
                    <span>Page 1 of 1</span>
                </div>
            </div>

            {/* Details Modal (Drilled Down View) */}
            {isDetailsOpen && selectedFarmer && (
                <ModalLayout
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    title="Farmer Profile"
                    size="xl"
                    footer={null}
                >
                    <FarmerDetails
                        farmer={selectedFarmer}
                        onEdit={() => { setIsDetailsOpen(false); setEditingFarmer(selectedFarmer); setIsFormOpen(true); }}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                </ModalLayout>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <ModalLayout
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    title={editingFarmer ? t('common.edit') + " " + t('farmers.table_farmer') : t('farmers.add_new')}
                    size="2xl"
                    footer={null}
                >
                    <FarmerForm
                        initialData={editingFarmer}
                        onSubmit={editingFarmer ? handleUpdate : handleCreate}
                        onCancel={() => setIsFormOpen(false)}
                        isLoading={false}
                    />
                </ModalLayout>
            )}

        </div>
    );
};

export default FarmersPage;
