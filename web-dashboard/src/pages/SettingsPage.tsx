import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    LockClosedIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    CommandLineIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

type TabType = 'general' | 'security' | 'notifications' | 'appearance' | 'workspace';

const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, changePassword, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Local state for preferences synced with Auth user
    const [prefs, setPrefs] = useState<any>(user?.preferences || {});

    useEffect(() => {
        if (user?.preferences) {
            setPrefs(user.preferences);
        }
    }, [user?.preferences]);

    // Sync i18n with user language if changed elsewhere
    useEffect(() => {
        if (user?.language && i18n.language !== user.language) {
            i18n.changeLanguage(user.language);
        }
    }, [user?.language, i18n]);

    const savePreference = async (key: string, value: any) => {
        const newPrefs = { ...prefs, [key]: value };
        setPrefs(newPrefs);
        try {
            await updateProfile({ preferences: newPrefs } as any);
        } catch (e) {
            console.error('Failed to save preference:', key, e);
            setFeedback({ type: 'error', text: 'Connection issue: Settings might not be saved' });
        }
    };

    const changeLanguage = async (lng: string) => {
        i18n.changeLanguage(lng);
        try {
            await updateProfile({ language: lng });
            setFeedback({ type: 'success', text: `Language changed to ${lng === 'en' ? 'English' : 'Français'}` });
        } catch (e) {
            setFeedback({ type: 'error', text: 'Failed to update language on server' });
        }
    };

    // Password state
    const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' });

    const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPwdData({ ...pwdData, [e.target.name]: e.target.value });
    };

    const onPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdData.new !== pwdData.confirm) {
            setFeedback({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setIsSubmitting(true);
        try {
            await changePassword(pwdData.old, pwdData.new);
            setFeedback({ type: 'success', text: 'Password changed successfully' });
            setPwdData({ old: '', new: '', confirm: '' });
        } catch (err: any) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setTimeout(() => setIsSubmitting(false), 800);
        }
    };

    const tabs: { id: TabType, label: string, icon: any, roles: string[] }[] = [
        { id: 'general', label: t('settings.general', 'General'), icon: GlobeAltIcon, roles: ['all'] },
        { id: 'security', label: t('settings.security', 'Security'), icon: LockClosedIcon, roles: ['all'] },
        { id: 'notifications', label: t('settings.notifications', 'Notifications'), icon: BellIcon, roles: ['all'] },
        { id: 'appearance', label: t('settings.appearance', 'Appearance'), icon: PaintBrushIcon, roles: ['all'] },
        { id: 'workspace', label: t('settings.workspace', 'Workspace'), icon: CommandLineIcon, roles: ['project_manager', 'admin'] },
    ];

    const filteredTabs = tabs.filter(tab =>
        tab.roles.includes('all') || (user && tab.roles.includes(user.role))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('settings.title')}</h1>
                <p className="text-lg text-slate-500 mt-1">{t('settings.subtitle')}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Navigation Sidebar */}
                <nav className="w-full lg:w-72 space-y-2 sticky top-8">
                    {filteredTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setFeedback(null);
                            }}
                            className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white text-brand-blue-700 shadow-md ring-1 ring-slate-200'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-brand-blue-600' : 'text-slate-400'}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue-600"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="flex-1 w-full min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                        >
                            {/* Feedback Alert */}
                            {feedback && (
                                <div className={`m-6 p-4 rounded-xl flex items-center border ${feedback.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                    : 'bg-rose-50 border-rose-100 text-rose-800'
                                    }`}>
                                    {feedback.type === 'success' ? (
                                        <CheckCircleIcon className="w-5 h-5 mr-3 text-emerald-500" />
                                    ) : (
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-rose-500" />
                                    )}
                                    <span className="text-sm font-medium">{feedback.text}</span>
                                    <button onClick={() => setFeedback(null)} className="ml-auto text-current opacity-50 hover:opacity-100">×</button>
                                </div>
                            )}

                            {/* Tab Content Components */}
                            {activeTab === 'general' && (
                                <GeneralSettings
                                    t={t}
                                    changeLanguage={changeLanguage}
                                    currentLang={i18n.language}
                                    prefs={prefs}
                                    savePreference={savePreference}
                                />
                            )}
                            {activeTab === 'security' && (
                                <SecuritySettings
                                    t={t}
                                    pwdData={pwdData}
                                    handlePwdChange={handlePwdChange}
                                    onPasswordSubmit={onPasswordSubmit}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                            {activeTab === 'notifications' && <NotificationSettings t={t} prefs={prefs} savePreference={savePreference} />}
                            {activeTab === 'appearance' && <AppearanceSettings t={t} prefs={prefs} savePreference={savePreference} />}
                            {activeTab === 'workspace' && <WorkspaceSettings t={t} prefs={prefs} savePreference={savePreference} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

/* Sub-components for better organization */

const GeneralSettings: React.FC<{
    t: any,
    changeLanguage: (l: string) => void,
    currentLang: string,
    prefs: any,
    savePreference: (k: string, v: any) => void
}> = ({ t, changeLanguage, currentLang, prefs, savePreference }) => (
    <div className="p-8 space-y-8">
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('settings.localization')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">{t('settings.lang_desc')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'en', label: 'English', sub: 'Regional primary' },
                    { id: 'fr', label: 'Français', sub: 'African standard' }
                ].map((lang) => (
                    <button
                        key={lang.id}
                        onClick={() => changeLanguage(lang.id)}
                        className={`p-5 text-left rounded-xl border-2 transition-all ${currentLang === lang.id
                            ? 'border-brand-blue-600 bg-brand-blue-50/50 ring-4 ring-brand-blue-50'
                            : 'border-slate-100 hover:border-slate-200'
                            }`}
                    >
                        <p className={`font-bold ${currentLang === lang.id ? 'text-brand-blue-900' : 'text-slate-900'}`}>{lang.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{lang.sub}</p>
                    </button>
                ))}
            </div>
        </section>

        <section className="pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('settings.format_units')}</h3>
            <p className="text-sm text-slate-500 mb-6">{t('settings.format_desc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('settings.currency')}</label>
                    <select
                        value={prefs.currency || 'RWF'}
                        onChange={(e) => savePreference('currency', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none font-medium"
                    >
                        <option value="RWF text-sm">RWF - Rwandan Franc</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('settings.date_format')}</label>
                    <select
                        value={prefs.dateFormat || 'DD/MM/YYYY'}
                        onChange={(e) => savePreference('dateFormat', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none font-medium"
                    >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
            </div>
        </section>
    </div>
);

const SecuritySettings: React.FC<{
    t: any,
    pwdData: any,
    handlePwdChange: (e: any) => void,
    onPasswordSubmit: (e: any) => void,
    isSubmitting: boolean
}> = ({ t, pwdData, handlePwdChange, onPasswordSubmit, isSubmitting }) => (
    <div className="p-8 space-y-10">
        <section>
            <div className="flex items-center mb-6">
                <div className="p-2.5 bg-indigo-50 rounded-xl mr-4 shadow-sm">
                    <LockClosedIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{t('settings.change_password')}</h3>
                    <p className="text-sm text-slate-500 font-medium">{t('settings.pwd_desc')}</p>
                </div>
            </div>

            <form onSubmit={onPasswordSubmit} className="max-w-md space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-0.5">{t('settings.current_pwd')}</label>
                    <input
                        type="password"
                        name="old"
                        value={pwdData.old}
                        onChange={handlePwdChange}
                        placeholder="••••••••"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none bg-slate-50/50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-0.5">{t('settings.new_pwd')}</label>
                    <input
                        type="password"
                        name="new"
                        value={pwdData.new}
                        onChange={handlePwdChange}
                        placeholder="At least 8 characters"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none bg-slate-50/50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-0.5">{t('settings.confirm_pwd')}</label>
                    <input
                        type="password"
                        name="confirm"
                        value={pwdData.confirm}
                        onChange={handlePwdChange}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue-500 outline-none bg-slate-50/50"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-3 w-full md:w-auto px-10 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 flex items-center justify-center translate-y-0 active:translate-y-0.5"
                >
                    {isSubmitting ? <ArrowPathIcon className="w-4 h-4 mr-3 animate-spin" /> : null}
                    {t('settings.update_password', 'Secure Account')}
                </button>
            </form>
        </section>

        <section className="pt-10 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center">
                <div className="p-2.5 bg-emerald-50 rounded-xl mr-4">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('settings.two_factor')}</h3>
                    <p className="text-sm text-slate-500 font-medium italic">{t('settings.two_factor_desc')}</p>
                </div>
            </div>
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-full">{t('settings.coming_soon')}</span>
        </section>
    </div>
);

const NotificationSettings: React.FC<{ t: any, prefs: any, savePreference: (k: string, v: any) => void }> = ({ t, prefs, savePreference }) => {
    const toggleNotif = (key: string) => {
        const notifs = prefs.notifications || { marketing: true, security: true, reports: true };
        savePreference('notifications', { ...notifs, [key]: !notifs[key] });
    };

    const n = prefs.notifications || { marketing: true, security: true, reports: true };

    return (
        <div className="p-8 space-y-10">
            <section>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{t('settings.comm_prefs')}</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">{t('settings.comm_desc')}</p>

                <div className="space-y-4">
                    {[
                        { id: 'marketing', label: t('settings.notif_marketing'), desc: t('settings.notif_marketing_desc') },
                        { id: 'security', label: t('settings.notif_security'), desc: t('settings.notif_security_desc'), forced: true },
                        { id: 'reports', label: t('settings.notif_reports'), desc: t('settings.notif_reports_desc') }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="max-w-md">
                                <p className="font-bold text-slate-900 leading-none mb-1">{item.label}</p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="ml-4">
                                <button
                                    onClick={() => !item.forced && toggleNotif(item.id)}
                                    disabled={item.forced}
                                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 outline-none ${(item.forced || n[item.id]) ? 'bg-brand-blue-600 shadow-inner' : 'bg-slate-300'
                                        } ${item.forced ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <motion.div
                                        animate={{ x: (item.forced || n[item.id]) ? 26 : 4 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pt-10 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t('settings.mobile_push')}</h3>
                <p className="text-sm text-slate-500 mb-6 italic">{t('settings.mobile_push_desc')}</p>
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-brand-blue-50 to-white border border-brand-blue-100 rounded-2xl">
                    <p className="text-xs font-bold text-brand-blue-900">Push token connectivity is managed via mobile device.</p>
                    <span className="text-xs font-black text-brand-blue-600 underline cursor-pointer hover:text-brand-blue-800">Refresh Link</span>
                </div>
            </section>
        </div>
    );
};

const AppearanceSettings: React.FC<{ t: any, prefs: any, savePreference: (k: string, v: any) => void }> = ({ t, prefs, savePreference }) => (
    <div className="p-8 space-y-10">
        <section>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">{t('settings.visual_theme')}</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic">{t('settings.theme_desc')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'light', label: t('settings.theme_light'), icon: '☀️' },
                    { id: 'dark', label: t('settings.theme_dark'), icon: '🌙', disabled: true }
                ].map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => !theme.disabled && savePreference('theme', theme.id)}
                        disabled={theme.disabled}
                        className={`p-6 text-center rounded-2xl border-2 transition-all relative overflow-hidden group ${(prefs.theme || 'light') === theme.id
                            ? 'border-brand-blue-600 bg-brand-blue-50/30 ring-4 ring-brand-blue-50/20 shadow-md'
                            : 'border-slate-100 hover:border-slate-300 opacity-60'
                            }`}
                    >
                        <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform ${theme.disabled ? 'grayscale' : ''}`}>{theme.icon}</div>
                        <p className="font-black text-slate-900 text-xs uppercase tracking-tighter">{theme.label}</p>
                        {theme.disabled && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center font-black text-[10px] text-slate-500 italic uppercase">Rolling out soon</div>}
                    </button>
                ))}
            </div>
        </section>

        <section className="pt-10 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('settings.data_density')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium italic">{t('settings.density_desc')}</p>
            <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-80">
                <button
                    onClick={() => savePreference('density', 'standard')}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${(prefs.density || 'standard') === 'standard' ? 'bg-white text-brand-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    {t('settings.density_standard')}
                </button>
                <button
                    onClick={() => savePreference('density', 'compact')}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${prefs.density === 'compact' ? 'bg-white text-brand-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    {t('settings.density_compact')}
                </button>
            </div>
        </section>
    </div>
);

const WorkspaceSettings: React.FC<{ t: any, prefs: any, savePreference: (k: string, v: any) => void }> = ({ t, prefs, savePreference }) => {
    const toggleAudit = (key: string) => {
        const audit = prefs.audit || { strictGps: true, mandatoryPhotos: false };
        savePreference('audit', { ...audit, [key]: !audit[key] });
    };

    const a = prefs.audit || { strictGps: true, mandatoryPhotos: false };

    return (
        <div className="p-8 space-y-10 font-primary">
            <section>
                <div className="flex items-center mb-8">
                    <div className="p-3 bg-brand-green-50 rounded-2xl mr-5 shadow-sm border border-brand-green-100">
                        <UserGroupIcon className="w-7 h-7 text-brand-green-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{t('settings.workspace_config')}</h3>
                        <p className="text-sm text-slate-500 font-bold italic">{t('settings.workspace_desc')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-7 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-5">
                        <div className="flex items-center text-brand-blue-800 mb-1">
                            <CommandLineIcon className="w-5 h-5 mr-3" />
                            <h4 className="font-black text-sm uppercase tracking-wider">{t('settings.sync_policy')}</h4>
                        </div>
                        <select
                            value={prefs.syncPolicy || '12h'}
                            onChange={(e) => savePreference('syncPolicy', e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-brand-blue-400 transition-all cursor-pointer"
                        >
                            <option value="1h">High Frequency (1h)</option>
                            <option value="4h">Balanced (4h)</option>
                            <option value="12h">Standard Policy (12h)</option>
                            <option value="24h">Daily Sync (24h)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-1">{t('settings.sync_desc')}</p>
                    </div>

                    <div className="p-7 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
                        <div className="flex items-center text-brand-green-800 mb-1">
                            <CheckCircleIcon className="w-5 h-5 mr-3" />
                            <h4 className="font-black text-sm uppercase tracking-wider">{t('settings.data_integrity')}</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'strictGps', label: 'Strict GPS Geofence' },
                                { id: 'mandatoryPhotos', label: 'Evidence Documentation' }
                            ].map(opt => (
                                <label key={opt.id} className="flex items-center justify-between cursor-pointer group p-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{opt.label}</span>
                                    <input
                                        type="checkbox"
                                        checked={a[opt.id]}
                                        onChange={() => toggleAudit(opt.id)}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-brand-green-600 focus:ring-brand-green-500 bg-white"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-10 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 p-8 rounded-[40px] mt-10">
                <div className="max-w-md">
                    <h4 className="font-black text-rose-900 mb-1 uppercase tracking-tighter">{t('settings.emergency_freeze')}</h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-normal italic">{t('settings.freeze_desc')}</p>
                </div>
                <button
                    onClick={() => alert('Platform Admin authorization required')}
                    className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                >
                    Initiate Freeze
                </button>
            </section>
        </div>
    );
};

export default SettingsPage;
