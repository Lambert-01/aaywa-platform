import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (session: any) => void;
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, onSchedule }) => {
    const [formData, setFormData] = useState({
        title: '',
        sessionType: 'Master Training',
        date: '',
        time: '',
        duration: '2',
        location: '',
        cohortId: '',
        trainerId: '',
        expectedAttendees: '',
        childcareProvided: false,
        materials: '',
        notes: ''
    });

    const [errors, setErrors] = useState<any>({});

    if (!isOpen) return null;

    const sessionTypes = ['Master Training', 'Champion Training', 'VSLA', 'Nutrition', 'Agronomy'];

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.cohortId) newErrors.cohortId = 'Cohort is required';
        if (!formData.expectedAttendees) newErrors.expectedAttendees = 'Expected attendees is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const sessionDateTime = new Date(`${formData.date}T${formData.time}`);
            onSchedule({
                ...formData,
                date: sessionDateTime.toISOString(),
                duration_hours: parseFloat(formData.duration),
                expected_attendees: parseInt(formData.expectedAttendees),
                materials: formData.materials ? formData.materials.split(',').map(m => m.trim()) : []
            });
            onClose();
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Schedule Training Session</h2>
                                <p className="text-green-100 text-sm">Create a new training session</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., Organic Pest Management Workshop"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Type *
                            </label>
                            <select
                                value={formData.sessionType}
                                onChange={(e) => handleChange('sessionType', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                {sessionTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cohort *
                            </label>
                            <select
                                value={formData.cohortId}
                                onChange={(e) => handleChange('cohortId', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.cohortId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select cohort...</option>
                                <option value="1">Cohort 1 - Northern Region</option>
                                <option value="2">Cohort 2 - Eastern Region</option>
                                <option value="3">Cohort 3 - Southern Region</option>
                                <option value="4">Cohort 4 - Western Region</option>
                            </select>
                            {errors.cohortId && <p className="mt-1 text-sm text-red-600">{errors.cohortId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time *
                            </label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.time ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (hours)
                            </label>
                            <select
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="1">1 hour</option>
                                <option value="1.5">1.5 hours</option>
                                <option value="2">2 hours</option>
                                <option value="2.5">2.5 hours</option>
                                <option value="3">3 hours</option>
                                <option value="4">4 hours</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Attendees *
                            </label>
                            <input
                                type="number"
                                value={formData.expectedAttendees}
                                onChange={(e) => handleChange('expectedAttendees', e.target.value)}
                                min="1"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.expectedAttendees ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="25"
                            />
                            {errors.expectedAttendees && <p className="mt-1 text-sm text-red-600">{errors.expectedAttendees}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPinIcon className="h-4 w-4 inline mr-1" />
                                Location *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., Community Center, Field Demonstration Plot"
                            />
                            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Training Materials (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.materials}
                                onChange={(e) => handleChange('materials', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., Handbook, Visual Aids, Demonstration Kit"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Additional notes or instructions..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.childcareProvided}
                                    onChange={(e) => handleChange('childcareProvided', e.target.checked)}
                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Childcare services will be provided
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <UserGroupIcon className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="text-sm text-green-800">
                                <p className="font-medium mb-1">Session Summary</p>
                                <p>
                                    {formData.title || 'Untitled Session'} • {formData.sessionType} • {formData.duration} hours
                                    {formData.childcareProvided && ' • Childcare Provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-green-500/30"
                        >
                            Schedule Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleSessionModal;
