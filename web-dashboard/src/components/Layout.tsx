import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './alerts/NotificationCenter';
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  TruckIcon,
  AcademicCapIcon,
  CogIcon,
  Bars3Icon,
  ChevronDownIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Helper for icons not imported above (to keep imports clean)
  function UserGroupIcon(props: any) { return <UsersIcon {...props} /> } // Reusing UsersIcon for now or import real one
  function RecycleIcon(props: any) { return <CogIcon {...props} /> }
  function BuildingStorefrontIcon(props: any) { return <MapIcon {...props} /> }
  function GlobeAltIcon(props: any) { return <MapIcon {...props} /> }

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon, roles: ['all'] },
    { name: 'Farmers', href: '/dashboard/farmers', icon: UsersIcon, roles: ['project_manager', 'agronomist', 'field_facilitator'] },
    { name: 'Users', href: '/dashboard/users', icon: UserCircleIcon, roles: ['project_manager'] },
    { name: 'Cohorts', href: '/dashboard/cohorts', icon: MapIcon, roles: ['project_manager', 'agronomist'] },
    { name: 'VSLA Groups', href: '/dashboard/vsla', icon: UserGroupIcon, roles: ['project_manager', 'field_facilitator'] },
    { name: 'Inputs & Sales', href: '/dashboard/inputs-sales', icon: TruckIcon, roles: ['project_manager', 'agronomist'] },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCartIcon, roles: ['all'] },
    { name: 'Compost', href: '/dashboard/compost', icon: RecycleIcon, roles: ['project_manager', 'agronomist'] },
    { name: 'Training', href: '/dashboard/training', icon: AcademicCapIcon, roles: ['project_manager', 'field_facilitator'] },
    { name: 'Warehouse', href: '/dashboard/warehouse', icon: BuildingStorefrontIcon, roles: ['project_manager', 'agronomist'] },
    { name: 'Geospatial Map', href: '/dashboard/maps', icon: GlobeAltIcon, roles: ['project_manager', 'agronomist'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes('all') || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden text-sans">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Compact Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col border-r border-slate-700/50`}>
        {/* Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3 px-2">
            <img
              src="/images/aaywa-logo.png"
              alt="AAYWA Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white">AAYWA & PARTNERS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-brand-blue-600/15 text-brand-blue-300 shadow-sm border border-brand-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-brand-blue-300' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue-400 shadow-[0_0_8px_rgba(56,197,255,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-700/50 bg-slate-800/50">
          <div className="relative">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs font-bold text-slate-200 group-hover:border-slate-400">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.replace('_', ' ') || 'Role'}</p>
              </div>
              <ChevronDownIcon className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
            </div>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-4 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
            <GlobalSearch />
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6 ml-auto">
            <NotificationCenter />
            <div className="h-6 w-px bg-gray-200"></div>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Help & Support
            </button>
          </div>
        </header>

        {/* Page Content Wrapper */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;