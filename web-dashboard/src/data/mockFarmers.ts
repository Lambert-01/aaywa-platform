// Mock data generator for 100 farmers
export interface Farmer {
    id: number;
    name: string;
    phone: string;
    cohort: number;
    role: 'Farmer' | 'Champion' | 'Casual';
    householdType: 'Teen Mother' | 'Regular' | 'Elderly';
    vslaBalance: number;
    lastSale: string | null;
    lastSaleAmount: number;
    joinedDate: string;
    plotSize: number; // hectares
    croppingSystem: 'Avocado' | 'Macadamia';
}

const firstNames = [
    'Uwimana', 'Mukamana', 'Niyonshuti', 'Habimana', 'Ndayisaba',
    'Kamanzi', 'Uwase', 'Nshuti', 'Mugabo', 'Umutoni',
    'Nsabimana', 'Mukandori', 'Byukusenge', 'Twagiram uremyi', 'Ingabire',
    'Mutesi', 'Umutoniwase', 'Gasana', 'Nkurunziza', 'Uwamariya'
];

const lastNames = [
    'Marie', 'Grace', 'Alice', 'Jeanne', 'Christine',
    'Vestine', 'Chantal', 'Esperance', 'Francine', 'Claudine',
    'Angelique', 'Beatrice', 'Diane', 'Ernestine', 'Faustin',
    'Georgette', 'Honorine', 'Immaculee', 'Josiane', 'Keza'
];

export const generateMockFarmers = (): Farmer[] => {
    const farmers: Farmer[] = [];

    for (let i = 1; i <= 100; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        // Assign cohorts evenly (25 each)
        const cohort = Math.ceil(i / 25);

        // Role distribution: 20 champions, 10 casuals, rest farmers
        let role: 'Farmer' | 'Champion' | 'Casual';
        if (i <= 20) role = 'Champion';
        else if (i > 90) role = 'Casual';
        else role = 'Farmer';

        // Household type: 35 teen mothers, spread across all farmers
        let householdType: 'Teen Mother' | 'Regular' | 'Elderly';
        if (i % 3 === 0 && i <= 35 * 3) householdType = 'Teen Mother';
        else if (i > 95) householdType = 'Elderly';
        else householdType = 'Regular';

        // Cropping system based on cohort (1-2 Avocado, 3-4 Macadamia)
        const croppingSystem = cohort <= 2 ? 'Avocado' : 'Macadamia';

        // Random data
        const vslaBalance = Math.floor(Math.random() * 50000) + 5000;
        const hasRecentSale = Math.random() > 0.3;
        const lastSaleAmount = hasRecentSale ? Math.floor(Math.random() * 80000) + 20000 : 0;
        const daysAgo = Math.floor(Math.random() * 60);
        const lastSale = hasRecentSale ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString() : null;

        const joinedDate = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString();
        const plotSize = Math.random() * 0.3 + 0.1; // 0.1 to 0.4 hectares

        farmers.push({
            id: i,
            name: `${firstName} ${lastName}`,
            phone: `+250 7${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
            cohort,
            role,
            householdType,
            vslaBalance,
            lastSale,
            lastSaleAmount,
            joinedDate,
            plotSize: Math.round(plotSize * 100) / 100,
            croppingSystem
        });
    }

    return farmers;
};

// Export singleton instance
export const mockFarmers = generateMockFarmers();
