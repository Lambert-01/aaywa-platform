import { useState, useCallback } from 'react';
import { apiGet } from '../../utils/api';

interface Member {
    id: number;
    full_name: string;
    farmer_id: number;
    current_balance: string;
    role: string;
}

interface Loan {
    id: number;
    amount: string;
    balance: string;
    member_id: number;
}

export const useVSLAData = (vslaId: string | number) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [financialSummary, setFinancialSummary] = useState<any[]>([]);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGet<Member[]>(`/vsla/${vslaId}/members`);
            setMembers(data);
            return data;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [vslaId]);

    const fetchFinancialSummary = useCallback(async () => {
        try {
            const data = await apiGet<any[]>(`/vsla/${vslaId}/members/financial`);
            setFinancialSummary(data);
            return data;
        } catch (err: any) {
            console.error(err);
            return [];
        }
    }, [vslaId]);

    // Mock fetching active loans for now
    const fetchActiveLoans = useCallback(async (memberId?: number) => {
        return [];
    }, [vslaId]);

    return {
        members,
        financialSummary,
        activeLoans,
        loading,
        error,
        fetchMembers,
        fetchFinancialSummary,
        fetchActiveLoans
    };
};
