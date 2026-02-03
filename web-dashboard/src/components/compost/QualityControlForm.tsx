import React, { useState } from 'react';
import ModalLayout from '../ModalLayout';
import { CompostBatch, QualityMetrics } from '../../types/dashboard.types';
import { apiPatch } from '../../utils/api';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface QualityControlFormProps {
    batch: CompostBatch | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const QualityControlForm: React.FC<QualityControlFormProps> = ({
    batch,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [moisture, setMoisture] = useState<number>(45);
    const [maturityScore, setMaturityScore] = useState<number>(7);
    const [particleSize, setParticleSize] = useState<'Fine' | 'Medium' | 'Coarse'>('Medium');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Safe guard: if batch is null, return null (after hooks to maintain hook order)
    if (!batch) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const qualityData: Partial<QualityMetrics> = {
                batchId: batch.id,
                moisture,
                maturityScore,
                particleSize,
                notes,
                testedBy: 'Current User', // This should come from auth context
                testedAt: new Date().toISOString(),
            };

            await apiPatch(`/compost/batches/${batch.id}/quality`, qualityData);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit quality report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMaturityLabel = (score: number): string => {
        if (score >= 9) return '🌟 Excellent - Ready for use';
        if (score >= 7) return '✅ Good - Nearly mature';
        if (score >= 5) return '🟡 Fair - Needs more curing';
        if (score >= 3) return '⚠️ Poor - More time needed';
        return '❌ Very Poor - Check process';
    };

    const getMoistureLabel = (moisture: number): string => {
        if (moisture < 35) return '🔴 Too Dry';
        if (moisture <= 50) return '✅ Optimal';
        if (moisture <= 55) return '🟡 Slightly Wet';
        return '🔴 Too Wet';
    };

    return (
        <ModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title={`Quality Control - ${batch.batchNumber}`}
            size="lg"
            footer={
                <div className="flex justify-between items-center w-full">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quality Report'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Batch Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Batch:</span> {batch.batchNumber}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Current Status:</span>{' '}
                        <span className="font-semibold text-gray-900">{batch.status}</span>
                    </p>
                </div>

                {/* Moisture Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Moisture Level: {moisture}% {getMoistureLabel(moisture)}
                    </label>
                    <input
                        type="range"
                        min="30"
                        max="60"
                        step="1"
                        value={moisture}
                        onChange={(e) => setMoisture(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #ef4444 0%, #10b981 ${((moisture - 30) / 30) * 100}%, #dc2626 100%)`,
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>30% (Too Dry)</span>
                        <span>45% (Optimal)</span>
                        <span>60% (Too Wet)</span>
                    </div>
                </div>

                {/* Maturity Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maturity Score: {maturityScore}/10
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button
                                key={score}
                                type="button"
                                onClick={() => setMaturityScore(score)}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${maturityScore >= score
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{getMaturityLabel(maturityScore)}</p>
                </div>

                {/* Particle Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Particle Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['Fine', 'Medium', 'Coarse'] as const).map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setParticleSize(size)}
                                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${particleSize === size
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Photo Upload (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality Photo (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors cursor-pointer">
                        <div className="space-y-1 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                                    <span>Upload a photo</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        id="notes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any observations about color, smell, temperature, or other quality indicators..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                </div>
            </form>
        </ModalLayout>
    );
};

export default QualityControlForm;
