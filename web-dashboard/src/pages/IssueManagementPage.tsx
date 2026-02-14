import React, { useState, useEffect } from 'react';
import {
    FunnelIcon, MagnifyingGlassIcon, MapPinIcon, CalendarIcon,
    ExclamationCircleIcon, EyeIcon, CheckCircleIcon,
    ArrowPathIcon, InboxIcon
} from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

interface Issue {
    id: number;
    farmer_id?: string;
    farmer_name?: string;
    category: string;
    description: string;
    urgency: string;
    status: string;
    date_reported: string;
    location?: string;
    gps_lat?: number;
    gps_lng?: number;
    photo_url?: string | null;
    [key: string]: any;
}

const IssueManagementPage: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchIssues = () => {
        setIsLoading(true);
        fetch('http://localhost:5000/api/farmer-issues')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setIssues(data);
                } else {
                    console.error('Expected array of issues, got:', data);
                    setIssues([]);
                }
            })
            .catch(err => console.error('Error fetching issues:', err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    // Stats calculation
    const stats = {
        total: issues.length,
        critical: issues.filter(i => i.urgency === 'High' && i.status !== 'Resolved').length,
        open: issues.filter(i => i.status === 'Open').length,
        resolved: issues.filter(i => i.status === 'Resolved').length
    };

    const columns = [
        {
            label: 'FARMER',
            key: 'farmer_name',
            render: (value: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {(row.farmer_name || row.farmer_id || '#').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.farmer_name || 'Unknown Farmer'}</div>
                        <div className="text-xs text-gray-500">ID: {row.farmer_id || row.id}</div>
                    </div>
                </div>
            )
        },
        {
            label: 'CATEGORY',
            key: 'category',
            render: (value: any) => (
                <span className="font-medium text-slate-700">{value}</span>
            )
        },
        {
            label: 'DESCRIPTION',
            key: 'description',
            render: (value: any, row: any) => (
                <div className="max-w-xs truncate text-slate-500" title={row.description}>
                    {row.description}
                </div>
            )
        },
        {
            label: 'URGENCY',
            key: 'urgency',
            render: (value: any, row: any) => {
                const val = row.urgency || 'Medium';
                const colors: any = {
                    'High': 'text-red-700 bg-red-50 ring-red-600/10',
                    'Medium': 'text-amber-700 bg-amber-50 ring-amber-600/10',
                    'Low': 'text-emerald-700 bg-emerald-50 ring-emerald-600/10',
                };
                const style = colors[val] || 'text-gray-600 bg-gray-50 ring-gray-500/10';
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
                        {val}
                    </span>
                );
            }
        },
        {
            label: 'DATE',
            key: 'date_reported',
            render: (value: any, row: any) => (
                <div className="flex items-center text-gray-500 text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {new Date(row.date_reported || row.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            label: 'STATUS',
            key: 'status',
            render: (value: any, row: any) => (
                <StatusBadge status={row.status || 'Open'} />
            )
        },
        {
            label: '',
            key: 'actions',
            render: (value: any, row: any) => (
                <div className="flex justify-end">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedIssue(row); setIsModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="View Details"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in p-2">
            {/* Header & Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Issue Management</h1>
                    <p className="text-gray-500 mt-2 text-lg">Monitor and resolve field issues reported by farmers.</p>
                </div>
                <button
                    onClick={fetchIssues}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm"
                >
                    <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Issues</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                        <span className="text-sm text-gray-400">reports</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
                    </div>
                    <div className="text-sm font-medium text-red-600 uppercase tracking-wide">Critical Attention</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-red-700">{stats.critical}</span>
                        <span className="text-sm text-red-500">high urgency</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-amber-600 uppercase tracking-wide">Pending</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-amber-700">{stats.open}</span>
                        <span className="text-sm text-amber-500">open tickets</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Resolved</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-emerald-700">{stats.resolved}</span>
                        <span className="text-sm text-emerald-500">completed</span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by farmer, category, or description..."
                        className="w-full pl-11 pr-4 py-3 border-none rounded-xl focus:ring-0 text-gray-900 placeholder-gray-400 bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-px md:h-auto w-full md:w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center px-4 py-2 gap-3">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                        className="border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer py-2 pl-0 pr-8"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Status: Open</option>
                        <option value="In Progress">Status: In Progress</option>
                        <option value="Resolved">Status: Resolved</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {issues.length === 0 && !isLoading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <InboxIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">
                            {statusFilter !== 'All' || searchTerm ? "Try adjusting your filters to see more results." : "There are no reported issues at the moment."}
                        </p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={issues.filter(i => {
                            const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
                            const term = searchTerm.toLowerCase();
                            const matchesSearch =
                                (i.description && i.description.toLowerCase().includes(term)) ||
                                (i.category && i.category.toLowerCase().includes(term)) ||
                                (i.farmer_name && i.farmer_name.toLowerCase().includes(term)); // Using farmer_name now if available
                            return matchesStatus && matchesSearch;
                        })}
                        onRowClick={(row) => { setSelectedIssue(row); setIsModalOpen(true); }}
                        headerClassName="bg-gray-50/80 border-b border-gray-100"
                    />
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedIssue && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Report ID: #{selectedIssue.id}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <span className="sr-only">Close</span>
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 font-bold">
                                            {(selectedIssue.farmer_name || selectedIssue.farmer_id || 'F').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide mb-0.5">Reported By</div>
                                            <div className="font-semibold text-gray-900 text-lg">{selectedIssue.farmer_name || 'Unknown Farmer'}</div>
                                            <div className="text-sm text-emerald-600/80 mt-1 flex items-center">
                                                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                                {new Date(selectedIssue.date_reported || selectedIssue.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between p-3 border-b border-gray-100/80">
                                            <span className="text-sm text-gray-500">Category</span>
                                            <span className="font-medium text-gray-900">{selectedIssue.category}</span>
                                        </div>
                                        <div className="flex justify-between p-3 border-b border-gray-100/80">
                                            <span className="text-sm text-gray-500">Urgency</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedIssue.urgency === 'High' ? 'bg-red-50 text-red-700' :
                                                    selectedIssue.urgency === 'Medium' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-emerald-50 text-emerald-700'
                                                }`}>
                                                {selectedIssue.urgency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 border-b border-gray-100/80">
                                            <span className="text-sm text-gray-500">Status</span>
                                            <StatusBadge status={selectedIssue.status || 'Open'} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 leading-relaxed text-sm">
                                            {selectedIssue.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media & Map */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photo Evidence</label>
                                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video relative group">
                                            {selectedIssue.photo_url ? (
                                                <>
                                                    <img
                                                        src={`http://localhost:5000${selectedIssue.photo_url}`}
                                                        alt="Evidence"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                    <div className="hidden absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                                                        Image failed to load
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                    <ExclamationCircleIcon className="h-8 w-8 mb-2 opacity-50" />
                                                    <span className="text-sm">No photo attached</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                    <MapPinIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">GPS Coordinates</div>
                                                    <div className="text-sm font-medium text-gray-900 font-mono">
                                                        {selectedIssue.gps_lat?.toFixed(6)}, {selectedIssue.gps_lng?.toFixed(6)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-xs text-blue-600 hover:underline font-medium">Open Map</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => alert('Resolution flow would start here!')}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center shadow-lg shadow-emerald-600/20 transition-all hover:translate-y-[-1px]"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                Mark as Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueManagementPage;
