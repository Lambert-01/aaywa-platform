# 🌍 Project AAYWA & PARTNERS: Comprehensive Platform Documentation

**Version:** 1.0  
**Date:** January 31, 2026  
**Status:** Active Development  

---

## 📖 Table of Contents

1.  [Executive Summary](#1-executive-summary)
2.  [Platform Architecture & Technology Stack](#2-platform-architecture--technology-stack)
3.  [Component Deep Dive: The Public Website](#3-component-deep-dive-the-public-website)
4.  [Component Deep Dive: The Operational Dashboard](#4-component-deep-dive-the-operational-dashboard)
5.  [Component Deep Dive: The Backend Infrastructure](#5-component-deep-dive-the-backend-infrastructure)
6.  [Data Models & Business Logic](#6-data-models--business-logic)
7.  [Future Roadmap: Mobile & IoT](#7-future-roadmap-mobile--iot)

---

## 1. Executive Summary

**Project AAYWA & PARTNERS** is not merely an agricultural management tool; it is a digital ecosystem designed to revolutionize the refined agriculture sector in Rwanda. At its core, the project seeks to dismantle the traditional charity-based models of development and replace them with a robust, dignity-driven business model. We empower young women farmers—specifically teen mothers and vulnerable youths—by providing them with land access, organic inputs, technical training, and direct market routes.

The platform serves as the digital backbone of this initiative, ensuring **Transparency**, **Traceability**, and **Trust**. By digitizing the entire value chain—from the soil composition in Huye to the final sale in Kigali or international markets—we create a verifiable record of impact that attracts premium buyers and impact investors.

### The Problem
*   **Fragmentation**: Smallholder farmers are disconnected from high-value markets.
*   **Lack of Data**: Banks and investors cannot verify the creditworthiness of unbanked farmers.
*   **Inefficiency**: Paper-based records lead to loss of produce, poor inventory management, and delayed payments.

### The Solution: AAYWA Platform
A unified digital infrastructure comprising:
1.  **Public Website**: For storytelling, branding, and market access.
2.  **Web Dashboard**: For rigorous operational management, M&E (Monitoring and Evaluation), and financial tracking.
3.  **Backend API**: The central nervous system processing real-time data.
4.  **Mobile App**: For field agents to capture data offline in remote areas.

---

## 2. Platform Architecture & Technology Stack

The system is built on a modern, scalable **MERN-like stack** (utilizing React for frontend and Node.js for backend), designed for performance, modularity, and offline-first capabilities.

### 2.1 Technology Stack

*   **Frontend (Website & Dashboard)**:
    *   **Framework**: React 18 with TypeScript for type safety and code reliability.
    *   **Styling**: Tailwind CSS for rapid, responsive utility-first styling. We use a custom design system featuring "Rwanda Blue" (`#00A1DE`), "Sanza Gold" (`#FFD700`), and "Deep Earth" (`#0A0A0A`).
    *   **Animation**: Framer Motion for premium, high-fidelity interactions (scroll reveals, hover effects).
    *   **State Management**: React Context API for managing global state (User Auth, Cart, Filters).

*   **Backend API**:
    *   **Runtime**: Node.js with Express.js architecture.
    *   **Pattern**: MVC (Model-View-Controller) ensuring separation of concerns.
    *   **Security**: JWT (JSON Web Tokens) for stateless authentication; Role-Based Access Control (RBAC) middleware.

*   **Database**:
    *   **Primary Store**: MongoDB (NoSQL) allows for flexible schema design, essential for the varying data structures of different crops and farmer profiles.
    *   **Geospatial Data**: Native GeoJSON support for mapping farm polygons and cohort locations.

---

## 3. Component Deep Dive: The Public Website (`/website`)

The website (`AAYWA & PARTNERS`) acts as the global face of the organization. It is not just an informational brochure but a conversion-driven platform designed to serve three distinct user personas: **Partners/Investors**, **Buyers**, and **General Public**.

### 3.1 Design Philosophy: "Premium Impact"
We moved away from the typical "NGO aesthetic" (often cluttered, rustic) to a **Premium, Corporate-Agri** look.
*   **Visual Language**: High-contrast dark mode foundation implies sophistication. Gold accents represent value/wealth, while Blue represents trust and water/sky.
*   **Typography**: *Clash Grotesk* for headlines provides a bold, editorial feel; *Inter* for body text ensures readability.

### 3.2 Key Pages & Features

#### **A. Home Page (`Home.tsx`)**
*   **Hero Section**: A full-screen cinematic experience with a video background capability. The headline "Young Women. Land. Dignity." sets the immediate tone.
*   **Impact Snapshot**: Three key metrics (Active Farmers, Hectares Regenerated, Income Increase) displayed with animated counters to show real-time progress.
*   **Interactive Map**: A visual representation of Rwanda showing our cohort locations. Users can hover over "Huye" or "Bugesera" to see specific crop data.
*   **Partners Carousel**: Social proof featuring logos of partners like MTN Rwanda and Afro Source.

#### **B. About Page (`AboutPage.tsx`)**
*   **Structure**: Restructured to show clear governance.
    *   *Board Members*: Top-level strategic direction (President Bonnette Ishimwe).
    *   *Advisors*: Technical experts in food science.
    *   *Effective Members*: The operational engine (Executive Director Shilla Ndegeya).
*   **Feature**: "Meet the Team" cards use a glassmorphism effect, revealing bios and LinkedIn connections on hover, fostering professional trust.

#### **C. The Model (`ModelPage.tsx`)**
*   **4-Step Journey**: A graphical timeline explaining the "Train → Farm → Sell → Share" methodology.
*   **Core Innovations**: Cards highlighting the 50/50 profit share, organic inputs, and financial inclusion (VSLA).
*   **Call to Action**: Strategy to convert visitors into franchise partners who want to replicate the AAYWA model.

#### **D. Marketplace (`Marketplace.tsx`)**
*   **E-Commerce Functionality**: Allows bulk buyers (restaurants, hotels) to browse seasonal availability.
*   **Cart System**: fully functional shopping cart with "Request Quote" logic (B2B focus) rather than instant credit card checkout, aligning with wholesale trade practices.

#### **E. Contact (`ContactPage.tsx`)**
*   **Smart Routing**: The form asks "I am a..." (Buyer, Partner, Researcher) to route inquiries to the correct department.
*   **Location Intelligence**: Embedded Google Map showing the exact headquarters and farm clusters.

---

## 4. Component Deep Dive: The Operational Dashboard (`/web-dashboard`)

This is the powerhouse of the platform. Used by the Executive Director, Agronomists, and Operations Managers to run the business.

### 4.1 Dashboard Overview (`Dashboard.tsx`)
*   **KPI Command Center**: The top bar displays vital health signs:
    *   *Total Active Cohorts*
    *   *Weekly Harvest Volume (tons)*
    *   *VSLA Total Savings (RWF)*
*   **Activity Feed**: A real-time log of system events (e.g., "Olive N. just recorded 50kg Compost batch", "New Order #1234 received").

### 4.2 Module Breakdown

#### **A. Farmer Management (`FarmersPage.tsx`)**
*   **Digital Identities**: Each farmer has a profile containing:
    *   Personal Info & ID
    *   Land Size & Geolocation
    *   Household dependencies (measuring social impact).
*   **Cohort Assignment**: Farmers are grouped into "Cohorts" (groups of 10-20) for easier training and collective selling.

#### **B. VSLA (Village Savings & Loan) (`VSLAView.tsx`)**
*   **Financial Inclusion**: Tracks the weekly savings of every woman.
*   **Loan Logic**: managing small micro-loans within the group. The system calculates interest, repayment schedules, and risk scores automatically.
*   **Visualization**: Charts showing the growth of "Social Funds" vs. "Investment Funds" over time.

#### **C. Compost & Inputs (`CompostPage.tsx`)**
*   **Production Tracking**: We treat compost like gold. The system tracks raw material inputs (manure, green waste) and output batches.
*   **Quality Control**: Agronomists can log temperature and moisture readings during the decomposition process.
*   **Stock Management**: knowing exactly how many tons of fertilizer are available for the next planting season.

#### **D. Supply Chain (Inputs & Sales) (`InputsSalesPage.tsx`)**
*   **Inventory**: Tracks seeds, tools, and equipment distributed to farmers.
*   **Invoicing**: Automatically generates invoices for inputs given on credit, to be deducted from harvest payments.
*   **Sales Records**: Logs every sale to external buyers. It calculates the "Sanza Share" (Project's cut) vs. "Farmer Share" automatically.

#### **E. Geospatial Intelligence (`MapsPage.tsx`)**
*   **Land Mapping**: Uses polygon data to render farm boundaries on a satellite map.
*   **Integration**: Color-coded overlay to show crop health or harvest readiness (Green = Ready, Yellow = Growing).

---

## 5. Component Deep Dive: The Backend Infrastructure (`/backend`)

The backend is built for **resilience** and **integrity**. It serves as the single source of truth.

### 5.1 API Structure (RESTful)
*   **`/api/farmers`**: CRUD operations for farmer profiles.
*   **`/api/cohorts`**: Managing groups and their aggregate data.
*   **`/api/sales`**: Transactional data.
*   **`/api/compost`**: IoT data logs for fertilizer production.

### 5.2 Database Schema (MongoDB Models)
*   **Farmer Model**:
    *   `_id`, `names`, `nationalId`, `phone`, `cohortId` (Ref), `landSize`.
*   **Sale Model**:
    *   `buyerName`, `items` [{ `crop`, `qty`, `price` }], `totalAmount`, `status` (Paid/Pending).
*   **VSLA Model**:
    *   Tracks complex nested structures of `cycles` -> `meetings` -> `transactions`.

### 5.3 Security & Role Management
*   **Middleware (`roleGuard.js`)**: Ensures strict access control.
    *   *Admin/Director*: Full access.
    *   *Agronomist*: Can View/Edit Crop Data, cannot Delete Financials.
    *   *Partner*: Read-only access to Impact Reports.

---

## 6. Data Models & Business Logic

The secret sauce of AAYWA is how logic is baked into the code:

1.  **The 50/50 Profit Share**: The `SaleController` contains logic that automatically splits revenue. When a sale is recorded, the system credits 50% to the Farmer's digital wallet and 50% to the operational account.
2.  **Credit Scoring**: By analyzing VSLA savings consistency + Harvest reliability, the system assigns a "Trust Score" to farmers, unlocking larger input loans.
3.  **Traceability**: Every batch of produce sold carries a `BatchID` that links back to the specific Farmer and Compost Batch used, ensuring full organic certification compliance.

---

## 7. Future Roadmap: Mobile & IoT

### Mobile App (Flutter)
Currently in early development (`/mobile-app`), this tool is for the **Field Officer**.
*   **Offline Mode**: Critical for rural areas. Agents can sync data when they reach Wi-Fi.
*   **GPS Capture**: Using the phone's GPS to map land polygons accurately.

### IoT Integration
*   **Soil Sensors**: Future plans to integrate LoRaWAN soil sensors that push moisture data directly to the Dashboard via the Backend API.

---

**Conclusion**: The AAYWA & PARTNERS Platform is not a prototype; it is a scalable, enterprise-grade solution ready to manage thousands of farmers, ensuring that technology serves the cause of human dignity and economic freedom.
