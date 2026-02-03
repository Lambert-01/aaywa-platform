// Utility functions for VSLA transaction calculations

export const calculateStipend = (days: number, rate: number = 3000): number => {
    return days * rate;
};

export const calculateLoanRepayment = (amount: number, interestRate: number = 5): number => {
    // Simple interest calculation for display purposes
    return amount + (amount * (interestRate / 100));
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0
    }).format(amount);
};
