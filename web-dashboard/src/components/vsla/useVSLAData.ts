import { useState, useCallback } from 'react';
import { apiGet } from '../../utils/api';

interface Member {
    id: number;
    full_name: string;
    farmer_id: number;
    current_balance: string; // From backend (aggregate)
    role: string;
    // New calculated fields
    credit_score?: number;
    repayment_rate?: number;
    savings_consistency?: number;
    attendance_rate?: number;
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

    const calculateTrustScore = (savings: number, repayment: number, attendance: number) => {
        // Weighted formula: (Savings * 0.4) + (Repayment * 0.4) + (Attendance * 0.2)
        // Normalize savings: assume 50,000 RWF is "100%" for now (simplified)
        const savingsScore = Math.min((savings / 50000) * 100, 100);
        return Math.round((savingsScore * 0.4) + (repayment * 0.4) + (attendance * 0.2));
    };

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch raw data
            const [membersData, financialData] = await Promise.all([
                apiGet<Member[]>(`/api/vsla/${vslaId}/members`),
                apiGet<any[]>(`/api/vsla/${vslaId}/members/financial`)
            ]);

            // Merge and calculate scores
            const membersWithScores = membersData.map(m => {
                const financial = financialData.find((f: any) => f.member_id === m.id) || {};

                // Mock random adherence data until we have granular transaction history for attendance
                // In a real app, these would come from the backend's `member_stats` table
                const savings = parseFloat(financial.total_savings || '0');
                const repaymentRate = Math.floor(Math.random() * (100 - 80 + 1)) + 80; // Mocked 80-100%
                const attendanceRate = Math.floor(Math.random() * (100 - 85 + 1)) + 85; // Mocked 85-100%

                return {
                    ...m,
                    current_balance: financial.total_savings || '0',
                    repayment_rate: repaymentRate,
                    attendance_rate: attendanceRate,
                    savings_consistency: savings,
                    credit_score: calculateTrustScore(savings, repaymentRate, attendanceRate)
                };
            });

            setMembers(membersWithScores);
            return membersWithScores;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [vslaId]);

    const fetchFinancialSummary = useCallback(async () => {
        try {
            const data = await apiGet<any[]>(`/api/vsla/${vslaId}/members/financial`);
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
