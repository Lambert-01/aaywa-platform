import React, { useState } from 'react';
import { XMarkIcon, DocumentTextIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Question {
    id: string;
    questionText: string;
    options: { [key: string]: string };
    correctAnswer: string;
    explanation: string;
    points: number;
}

interface QuizBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quiz: any) => void;
    editQuiz?: any;
}

const QuizBuilderModal: React.FC<QuizBuilderModalProps> = ({ isOpen, onClose, onSave, editQuiz }) => {
    const [formData, setFormData] = useState({
        title: editQuiz?.title || '',
        category: editQuiz?.category || 'Agronomy',
        passingScore: editQuiz?.passingScore || '70',
        sessionId: editQuiz?.sessionId || ''
    });

    const [questions, setQuestions] = useState<Question[]>(editQuiz?.questions || [
        {
            id: '1',
            questionText: '',
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            explanation: '',
            points: 1
        }
    ]);

    if (!isOpen) return null;

    const categories = ['Agronomy', 'VSLA', 'Nutrition', 'Compost', 'Business Skills'];

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            questionText: '',
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            explanation: '',
            points: 1
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const handleRemoveQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id: string, field: string, value: any) => {
        setQuestions(prev => prev.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const handleOptionChange = (questionId: string, optionKey: string, value: string) => {
        setQuestions(prev => prev.map(q =>
            q.id === questionId
                ? { ...q, options: { ...q.options, [optionKey]: value } }
                : q
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        const quizData = {
            ...formData,
            questions,
            totalPoints,
            passing_score: parseFloat(formData.passingScore)
        };
        onSave(quizData);
        onClose();
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <DocumentTextIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {editQuiz ? 'Edit Quiz' : 'Create Quiz / Test'}
                                </h2>
                                <p className="text-orange-100 text-sm">Build an assessment for your training module</p>
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
                    {/* Quiz Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Quiz Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quiz Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="e.g., Organic Pest Management Assessment"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.passingScore}
                                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: e.target.value }))}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Points
                                </label>
                                <input
                                    type="text"
                                    value={totalPoints}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Questions ({questions.length})</h3>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-all font-medium"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Add Question</span>
                            </button>
                        </div>

                        {questions.map((question, qIndex) => (
                            <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                                {/* Question Header */}
                                <div className="flex items-start justify-between">
                                    <h4 className="text-base font-semibold text-gray-900">Question {qIndex + 1}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600">Points:</label>
                                            <input
                                                type="number"
                                                value={question.points}
                                                onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value) || 1)}
                                                min="1"
                                                max="10"
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                            />
                                        </div>
                                        {questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(question.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Text *
                                    </label>
                                    <textarea
                                        value={question.questionText}
                                        onChange={(e) => handleQuestionChange(question.id, 'questionText', e.target.value)}
                                        required
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        placeholder="Enter your question here..."
                                    />
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(question.options).map((optionKey) => (
                                        <div key={optionKey} className="flex items-start space-x-2">
                                            <div className="flex-shrink-0 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionChange(question.id, 'correctAnswer', optionKey)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${question.correctAnswer === optionKey
                                                            ? 'border-green-500 bg-green-500'
                                                            : 'border-gray-300 hover:border-green-400'
                                                        }`}
                                                    title="Mark as correct answer"
                                                >
                                                    {question.correctAnswer === optionKey && (
                                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Option {optionKey}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={question.options[optionKey]}
                                                    onChange={(e) => handleOptionChange(question.id, optionKey, e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder={`Option ${optionKey}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Explanation (Optional)
                                    </label>
                                    <textarea
                                        value={question.explanation}
                                        onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        placeholder="Provide an explanation for the correct answer..."
                                    />
                                </div>

                                {/* Correct Answer Indicator */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 text-sm text-green-800">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span className="font-medium">
                                            Correct Answer: Option {question.correctAnswer}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-orange-900 mb-2">Quiz Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-orange-600">Total Questions</div>
                                <div className="text-xl font-bold text-orange-900">{questions.length}</div>
                            </div>
                            <div>
                                <div className="text-orange-600">Total Points</div>
                                <div className="text-xl font-bold text-orange-900">{totalPoints}</div>
                            </div>
                            <div>
                                <div className="text-orange-600">Passing Score</div>
                                <div className="text-xl font-bold text-orange-900">{formData.passingScore}%</div>
                            </div>
                            <div>
                                <div className="text-orange-600">Points to Pass</div>
                                <div className="text-xl font-bold text-orange-900">
                                    {Math.ceil((totalPoints * parseFloat(formData.passingScore)) / 100)}
                                </div>
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
                            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all font-medium shadow-lg shadow-orange-500/30"
                        >
                            {editQuiz ? 'Update Quiz' : 'Create Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizBuilderModal;
