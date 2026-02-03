import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: string | number;
    title: string;
    type: 'farmer' | 'cohort' | 'page';
    url: string;
}

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock search logic - in production this would call an API
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const mockData: SearchResult[] = [
            { id: 'p1', title: 'Dashboard', type: 'page', url: '/dashboard' },
            { id: 'p2', title: 'Farmers List', type: 'page', url: '/dashboard/farmers' },
            { id: 'p3', title: 'Cohorts Map', type: 'page', url: '/dashboard/map' },
            { id: 'f1', title: 'Jean Baptiste (Farmer)', type: 'farmer', url: '/dashboard/farmers/1' },
            { id: 'f2', title: 'Marie Claire (Farmer)', type: 'farmer', url: '/dashboard/farmers/2' },
            { id: 'c1', title: 'Avocado North (Cohort)', type: 'cohort', url: '/dashboard/cohorts/1' },
        ];

        const filtered = mockData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsOpen(true);
    }, [query]);

    const handleSelect = (url: string) => {
        navigate(url);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue-500/20 focus:border-brand-blue-500 transition-all sm:text-sm"
                    placeholder="Search farmers, cohorts, or pages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
            </div>

            {/* Search Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-60 overflow-auto">
                    {results.map((result) => (
                        <button
                            key={result.id}
                            onClick={() => handleSelect(result.url)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue-50 hover:text-brand-blue-700 flex items-center justify-between group"
                        >
                            <span>{result.title}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-brand-blue-400">{result.type}</span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && results.length === 0 && query.length >= 2 && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-4 z-50 text-center text-sm text-gray-500">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
