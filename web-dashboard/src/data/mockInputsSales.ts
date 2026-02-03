export interface InputInvoice {
    id: number;
    farmerId: number;
    farmerName: string;
    cohort: number;
    items: string;
    total: number;
    status: 'Paid' | 'Pending' | 'Partial';
    issued: string;
    repaid: number;
}

export interface SaleTransaction {
    id: number;
    farmerId: number;
    farmerName: string;
    cohort: number;
    crop: string;
    quantity: number; // kg
    pricePerKg: number;
    gross: number;
    inputDeducted: number;
    net: number;
    farmerShare: number;
    sanzaShare: number;
    date: string;
}

// Generate mock input invoices
export const generateMockInputs = (): InputInvoice[] => {
    const inputs: InputInvoice[] = [];
    const items = [
        'Fertilizer (NPK 17-17-17)',
        'Pesticides, Seeds',
        'Tools, Fertilizer',
        'NPK, Manure, Seeds',
        'Equipment rental'
    ];

    for (let i = 1; i <= 50; i++) {
        const total = Math.floor(Math.random() * 8000) + 2000; // 2000-10000 RWF
        const repaidPercent = Math.random();
        const repaid = repaidPercent > 0.9 ? total : Math.floor(total * repaidPercent);

        let status: 'Paid' | 'Pending' | 'Partial';
        if (repaid === total) status = 'Paid';
        else if (repaid === 0) status = 'Pending';
        else status = 'Partial';

        inputs.push({
            id: i,
            farmerId: i,
            farmerName: `Farmer ${i}`,
            cohort: Math.ceil(i / 12.5),
            items: items[Math.floor(Math.random() * items.length)],
            total,
            status,
            issued: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
            repaid
        });
    }

    return inputs;
};

// Generate mock sales
export const generateMockSales = (): SaleTransaction[] => {
    const sales: SaleTransaction[] = [];
    const crops = ['Avocado', 'Macadamia', 'Amaranth', 'Tomatoes'];

    for (let i = 1; i <= 80; i++) {
        const quantity = Math.floor(Math.random() * 100) + 10; // 10-110 kg
        const pricePerKg = crops[Math.floor(Math.random() * crops.length)] === 'Avocado' ? 800 : 600;
        const gross = quantity * pricePerKg;

        // Deduct outstanding inputs (some farmers have 0)
        const inputDeducted = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
        const net = gross - inputDeducted;

        // 50/50 split
        const farmerShare = net / 2;
        const sanzaShare = net / 2;

        sales.push({
            id: i,
            farmerId: i,
            farmerName: `Farmer ${i}`,
            cohort: Math.ceil(i / 20),
            crop: crops[Math.floor(Math.random() * crops.length)],
            quantity,
            pricePerKg,
            gross,
            inputDeducted,
            net,
            farmerShare,
            sanzaShare,
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
        });
    }

    return sales;
};

export const mockInputs = generateMockInputs();
export const mockSales = generateMockSales();
