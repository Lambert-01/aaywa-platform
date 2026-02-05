import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    FunnelIcon,
    BellAlertIcon,
    EnvelopeIcon,
    PhoneIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../api/config';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
}

interface PendingUser {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    requested_role: string;
    registration_notes?: string;
    registration_date: string;
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: {
        [key: string]: number;
    };
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'users' | 'pending'>('users');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'field_facilitator',
        is_active: true
    });

    const [approvalData, setApprovalData] = useState({
        password: '',
        role: 'field_facilitator'
    });

    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchPendingUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${API_URL}/api/users/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPendingUsers(data);
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
        }
    };

    const handleApprove = async () => {
        if (!selectedPendingUser) return;

        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/${selectedPendingUser.id}/approve`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(approvalData)
                }
            );

            if (response.ok) {
                await fetchUsers();
                await fetchPendingUsers();
                setShowApproveModal(false);
                setSelectedPendingUser(null);
                setApprovalData({ password: '', role: 'field_facilitator' });
                alert('✅ User approved successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to approve user');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user');
        }
    };

    const handleReject = async () => {
        if (!selectedPendingUser) return;

        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(
                `${API_URL}/api/users/${selectedPendingUser.id}/reject`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason: rejectionReason })
                }
            );

            if (response.ok) {
                await fetchPendingUsers();
                setShowRejectModal(false);
                setSelectedPendingUser(null);
                setRejectionReason('');
                alert('User registration rejected');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to reject user');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Failed to reject user');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('aaywa_token');
            const url = editingUser
                ? `${API_URL}/api/users/${editingUser.id}`
                : `${API_URL}/api/users`;

            const method = editingUser ? 'PATCH' : 'POST';
            const payload = editingUser
                ? { full_name: formData.full_name, role: formData.role, is_active: formData.is_active }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchUsers();
                setShowModal(false);
                setEditingUser(null);
                setFormData({ full_name: '', email: '', password: '', role: 'field_facilitator', is_active: true });
            } else {
                const error = await response.json();
                if (response.status === 409 || error.error?.includes('exists') || error.error?.includes('duplicate')) {
                    alert('⚠️ This email address is already registered. Please use a different email.');
                } else {
                    alert(error.error || error.message || 'Failed to save user');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to save user');
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('aaywa_token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchUsers();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active
        });
        setShowModal(true);
    };

    const openApproveModal = (user: PendingUser) => {
        setSelectedPendingUser(user);
        setApprovalData({
            password: '',
            role: user.requested_role || 'field_facilitator'
        });
        setShowApproveModal(true);
    };

    const openRejectModal = (user: PendingUser) => {
        setSelectedPendingUser(user);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // Calculate statistics
    const stats: UserStats = React.useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.is_active).length;
        const inactive = total - active;
        const pending = pendingUsers.length;
        const byRole = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        return { total, active, inactive, pending, byRole };
    }, [users, pendingUsers]);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'project_manager': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'agronomist': return 'bg-green-100 text-green-800 border-green-200';
            case 'field_facilitator': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleIcon = (role: string) => {
        const iconClass = "w-4 h-4 mr-1.5";
        return <UserGroupIcon className={iconClass} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage staff users, roles, and permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ full_name: '', email: '', password: '', role: 'field_facilitator', is_active: true });
                        setShowModal(true);
                    }}
                    className="group bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-semibold">Add New User</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'users'
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Active Users
                    <span className="ml-2 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                        {stats.total}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'pending'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pending Approvals
                    {stats.pending > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full animate-pulse">
                            {stats.pending}
                        </span>
                    )}
                </button>
            </div>

            {/* Pending Approvals Tab */}
            {activeTab === 'pending' && (
                <div className="space-y-6">
                    {/* Pending Stats */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Pending Requests</p>
                                <p className="text-4xl font-bold text-orange-900 mt-2">{stats.pending}</p>
                                <p className="text-sm text-orange-700 mt-1">Awaiting your review</p>
                            </div>
                            <div className="bg-orange-500 p-4 rounded-xl">
                                <BellAlertIcon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Users Grid */}
                    {pendingUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                            <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No Pending Requests</h3>
                            <p className="text-gray-500">All registration requests have been processed</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6 hover:shadow-xl transition-shadow"
                                >
                                    {/* User Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    {new Date(user.registration_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full border-2 border-orange-200">
                                            PENDING
                                        </span>
                                    </div>

                                    {/* User Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-sm">
                                            <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-gray-700">{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center text-sm">
                                                <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-700">{user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm">
                                            <BriefcaseIcon className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getRoleBadgeColor(user.requested_role)}`}>
                                                {user.requested_role.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {user.registration_notes && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Message:</p>
                                                <p className="text-sm text-gray-700 italic">"{user.registration_notes}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => openApproveModal(user)}
                                            className="flex-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(user)}
                                            className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Active Users Tab */}
            {activeTab === 'users' && (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Users */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
                                    <p className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</p>
                                </div>
                                <div className="bg-blue-500 p-4 rounded-xl">
                                    <UserGroupIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Active</p>
                                    <p className="text-4xl font-bold text-green-900 mt-2">{stats.active}</p>
                                </div>
                                <div className="bg-green-500 p-4 rounded-xl">
                                    <CheckCircleIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Inactive Users */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">Inactive</p>
                                    <p className="text-4xl font-bold text-red-900 mt-2">{stats.inactive}</p>
                                </div>
                                <div className="bg-red-500 p-4 rounded-xl">
                                    <XCircleIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Roles Breakdown */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">By Role</p>
                                <div className="bg-purple-500 p-2 rounded-lg">
                                    <FunnelIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(stats.byRole).map(([role, count]) => (
                                    <div key={role} className="flex justify-between items-center text-sm">
                                        <span className="text-purple-700 capitalize">{role.replace('_', ' ')}</span>
                                        <span className="font-bold text-purple-900 bg-purple-200 px-3 py-1 rounded-full">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="project_manager">Project Manager</option>
                                    <option value="agronomist">Agronomist</option>
                                    <option value="field_facilitator">Field Facilitator</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Filter Chips */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${statusFilter === 'all'
                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({users.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${statusFilter === 'active'
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Active ({stats.active})
                            </button>
                            <button
                                onClick={() => setStatusFilter('inactive')}
                                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${statusFilter === 'inactive'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Inactive ({stats.inactive})
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {user.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{user.full_name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            <ClockIcon className="w-3 h-3 inline mr-1" />
                                                            Joined {new Date(user.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${getRoleBadgeColor(user.role)}`}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user.is_active
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-200'
                                                    : 'bg-red-100 text-red-800 border-2 border-red-200'
                                                    }`}>
                                                    {user.is_active ? (
                                                        <><CheckCircleIcon className="w-3 h-3 mr-1" /> ACTIVE</>
                                                    ) : (
                                                        <><XCircleIcon className="w-3 h-3 mr-1" /> INACTIVE</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : (
                                                    <span className="text-gray-400 italic">Never</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No users found matching your criteria</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Create/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            {!editingUser && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="field_facilitator">Field Facilitator</option>
                                    <option value="agronomist">Agronomist</option>
                                    <option value="project_manager">Project Manager</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                                />
                                <label className="text-sm font-semibold text-gray-700">Active User</label>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedPendingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
                        <h2 className="text-3xl font-bold text-green-600 mb-6">Approve User</h2>
                        <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                            <p className="text-sm font-semibold text-green-900">{selectedPendingUser.full_name}</p>
                            <p className="text-xs text-green-700 mt-1">{selectedPendingUser.email}</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Set Password</label>
                                <input
                                    type="password"
                                    value={approvalData.password}
                                    onChange={(e) => setApprovalData({ ...approvalData, password: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none"
                                    placeholder="Enter initial password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Role</label>
                                <select
                                    value={approvalData.role}
                                    onChange={(e) => setApprovalData({ ...approvalData, role: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all outline-none"
                                >
                                    <option value="field_facilitator">Field Facilitator</option>
                                    <option value="agronomist">Agronomist</option>
                                    <option value="project_manager">Project Manager</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setSelectedPendingUser(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    Approve User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedPendingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
                        <h2 className="text-3xl font-bold text-red-600 mb-6">Reject Request</h2>
                        <div className="mb-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                            <p className="text-sm font-semibold text-red-900">{selectedPendingUser.full_name}</p>
                            <p className="text-xs text-red-700 mt-1">{selectedPendingUser.email}</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason (Optional)</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none resize-none"
                                    rows={4}
                                    placeholder="Enter reason for rejection..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedPendingUser(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    Reject Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default UsersPage;
