// Shared TypeScript interfaces for AAYWA & PARTNERS Dashboard

// ==================== COMPOST MODULE ====================

export interface CompostBatch {
    id: string;
    batchNumber: string;
    feedstockMix: FeedstockItem[];
    startDate: string;
    maturityDate: string;
    kgProduced: number;
    qualityScore: number | null;
    status: 'In Progress' | 'Curing' | 'Mature' | 'Sold';
    cohortId: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface FeedstockItem {
    type: string;
    percentage: number;
    kgAmount: number;
}

export interface Workday {
    id: string;
    batchId: string;
    farmerId: string;
    farmerName: string;
    date: string;
    tasks: string[];
    hoursWorked: number;
    isPaid: boolean;
    paymentDate?: string;
}

export interface QualityMetrics {
    batchId: string;
    moisture: number; // 30-60%
    maturityScore: number; // 1-10
    particleSize: 'Fine' | 'Medium' | 'Coarse';
    photoUrl?: string;
    notes: string;
    testedBy: string;
    testedAt: string;
}

export interface Stipend {
    id: string;
    farmerId: string;
    farmerName: string;
    batchId: string;
    daysWorked: number;
    tasks: string[];
    baseStipend: number; // RWF 3,000/day
    qualityBonus: number;
    totalStipend: number;
    status: 'Pending' | 'Paid' | 'Failed';
    paymentDate?: string;
    momoTransactionId?: string;
}

export interface SurplusSale {
    id: string;
    batchId: string;
    buyerName: string;
    buyerContact: string;
    kgSold: number;
    pricePerKg: number;
    totalRevenue: number;
    saleDate: string;
    paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer';
}

export interface CompostSummary {
    totalBatches: number;
    activeBatches: number;
    totalKgProduced: number;
    avgQualityScore: number;
    totalStipendsPaid: number;
    surplusKgForSale: number;
    costPerKg: number;
}

// ==================== TRAINING MODULE ====================

export interface TrainingSession {
    id: string;
    date: string;
    topic: string;
    cohortId: number;
    trainerId: string;
    trainerName: string;
    sessionType: 'Master Training' | 'Champion Training' | 'VSLA' | 'Nutrition' | 'Agronomy';
    expectedAttendees: number;
    actualAttendees: number;
    materialsUsed: string[];
    childcareProvided: boolean;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    createdAt: string;
}

export interface Attendance {
    id: string;
    sessionId: string;
    farmerId: string;
    farmerName: string;
    attended: boolean;
    childcareUsed: boolean;
    feedbackScore?: number; // 1-5
    notes?: string;
}

export interface Champion {
    id: string;
    farmerId: string;
    farmerName: string;
    cohortId: number;
    peersAssigned: number;
    peersTrained: number;
    sessionsLed: number;
    avgAttendanceRate: number;
    avgFeedbackScore: number;
    certifiedDate: string;
}

export interface TrainingMaterial {
    id: string;
    title: string;
    category: 'Agronomy' | 'VSLA' | 'Nutrition' | 'Compost' | 'Business Skills';
    type: 'PDF' | 'Video' | 'Audio' | 'Image';
    fileUrl: string;
    version: string;
    uploadedBy: string;
    uploadedAt: string;
    description?: string;
}

export interface TrainingStats {
    totalSessions: number;
    avgAttendanceRate: number;
    championsTrained: number;
    peersMentored: number;
    materialsDistributed: number;
    childcareProvidedCount: number;
}

// ==================== MAP MODULE ====================

export interface CohortGeoJSON {
    type: 'Feature';
    properties: {
        cohortId: number;
        cohortName: string;
        croppingSystem: string;
        farmerCount: number;
        avgPlotSize: number;
    };
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export interface FarmerLocation {
    farmerId: string;
    farmerName: string;
    cohortId: number;
    plotSize: number;
    croppingSystem: string;
    latitude: number;
    longitude: number;
    lastYield?: number; // kg/ha
    lastSaleAmount?: number;
    attendanceRate?: number; // percentage
}

export interface Warehouse {
    id: string;
    name: string;
    type: 'Storage' | 'Aggregation Center' | 'Childcare Hub';
    latitude: number;
    longitude: number;
    capacity?: number;
    currentStock?: number;
    cohortIds: number[];
}

export interface LayerConfig {
    id: string;
    name: string;
    visible: boolean;
    color?: string;
    icon?: string;
}

export interface Measurement {
    id: string;
    type: 'distance' | 'area';
    value: number;
    unit: string;
    coordinates: number[][];
    createdAt: string;
}

export interface DataOverlay {
    type: 'yield' | 'income' | 'attendance';
    metric: string;
    data: { [farmerId: string]: number };
    colorScale: string[];
}

// ==================== SHARED TYPES ====================

export interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface FilterOptions {
    cohortId?: number[];
    dateFrom?: string;
    dateTo?: string;
    status?: string[];
}

// ==================== ORDER/CATALOG MODULE ====================

export interface Product {
    id: string;
    cropType: string;
    variety: string;
    cohort: string;
    harvestDate: string;
    availableQuantity: number;
    pricePerKg: number;
    qualityCert: string[];
    storageLocation: string;
    imageUrl?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    cropType: string;
    variety: string;
    quantity: number;
    pricePerKg: number;
    subtotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    buyerName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    items: OrderItem[];
    totalQuantity: number;
    totalValue: number;
    deliveryDay: string;
    specialInstructions?: string;
    status: string;
    paymentStatus: string;
    paymentDueDate: string;
    paymentDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
    buyerName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    items: { productId: string; quantity: number }[];
    deliveryDay: string;
    specialInstructions?: string;
}

export interface OrderStats {
    pendingOrders: number;
    weeklyRevenue: number;
    avgOrderSize: number;
    paymentRate: number;
    totalOrders: number;
    deliveredOrders: number;
}
