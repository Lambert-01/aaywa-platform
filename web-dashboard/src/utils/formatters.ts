// Currency formatting for RWF
export const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('en-RW')} RWF`;
};

// Date formatting to DD/MM/YYYY
export const safeFormatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Relative date (e.g., "2 days ago")
export const formatRelativeDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return safeFormatDate(d);
};

// Export to CSV
export const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
        Object.values(row).map(val =>
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

// Phone number formatting for Rwanda (+250)
export const formatPhone = (phone: string | null | undefined): string => {
    if (!phone) return 'N/A';

    // Remove any non-digit characters
    const cleaned = String(phone).replace(/\D/g, '');

    // Format as +250 XXX XXX XXX
    if (cleaned.startsWith('250')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    return phone;
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};

// Status color mapping
export const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
        active: 'green',
        pending: 'yellow',
        completed: 'blue',
        failed: 'red',
        warning: 'orange',
        healthy: 'green',
        'at-risk': 'red',
    };
    return statusMap[status.toLowerCase()] || 'gray';
};
