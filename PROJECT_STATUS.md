# 🌍 Project AAYWA & PARTNERS - Complete File Structure

## 📂 Project Root (`/`)
Core documentation and presentation assets.
```text
aaywa-platform/
├── AAAYw__DOCUMENTATIION.pdf
├── AAYWA PROJECT - DUFATANYE TUGABANE - DRAFT 3.pdf
├── Project_AAYWA_Presentation.pptx
├── backend/
├── mobile-app/
├── web-dashboard/
└── website/
```

## 📂 Backend (`/backend`)
Server-side logic, API endpoints, and database models.
```text
backend/
├── .env
├── .env.example
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── cohortController.js
    │   ├── compostController.js
    │   ├── farmerController.js
    │   ├── inputController.js
    │   ├── saleController.js
    │   ├── trainingController.js
    │   ├── userController.js
    │   ├── vslaController.js
    │   └── warehouseController.js
    ├── middleware/
    │   ├── auth.js
    │   └── roleGuard.js
    ├── models/
    │   ├── Catalog.js
    │   ├── Cohort.js
    │   ├── Compost.js
    │   ├── Farmer.js
    │   ├── InputInvoice.js
    │   ├── Sale.js
    │   ├── Training.js
    │   ├── User.js
    │   ├── VSLA.js
    │   └── Warehouse.js
    └── routes/
        ├── cohorts.routes.js
        ├── compost.routes.js
        ├── farmers.routes.js
        ├── inputs.routes.js
        ├── sales.routes.js
        ├── training.routes.js
        ├── users.routes.js
        ├── vsla.routes.js
        └── warehouses.routes.js
```

## 🌐 Website (`/website`)
Public-facing platform for brand, storytelling, and market engagement.
```text
website/
├── .env
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── public/
└── src/
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── index.tsx
    ├── react-app-env.d.ts
    ├── reportWebVitals.ts
    ├── setupTests.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── Hero.tsx
    │   ├── Impact.tsx
    │   ├── Model.tsx
    │   ├── Partners.tsx
    │   ├── Platform.tsx
    │   ├── About.tsx
    │   ├── contact/
    │   │   ├── ContactForm.tsx
    │   │   ├── ContactHero.tsx
    │   │   ├── ContactMethods.tsx
    │   │   ├── LocationSection.tsx
    │   │   └── SocialProof.tsx
    │   ├── home/
    │   │   ├── HeroSection.tsx
    │   │   ├── ImpactSnapshot.tsx
    │   │   ├── InteractiveMap.tsx
    │   │   ├── PartnersCarousel.tsx
    │   │   └── StorySection.tsx
    │   ├── marketplace/
    │   │   ├── CartDrawer.tsx
    │   │   ├── CategoryFilter.tsx
    │   │   ├── CheckoutForm.tsx
    │   │   ├── OrderConfirmation.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGrid.tsx
    │   │   └── ShoppingCart.tsx
    │   └── model/
    │       ├── CohortMap.tsx
    │       ├── CoreInnovations.tsx
    │       ├── FourStepJourney.tsx
    │       ├── ModelHero.tsx
    │       └── ModelImpactSnapshot.tsx
    ├── pages/
    │   ├── AboutPage.tsx
    │   ├── Blog.tsx
    │   ├── Contact.tsx
    │   ├── ContactPage.tsx
    │   ├── Home.tsx
    │   ├── Marketplace.tsx
    │   └── ModelPage.tsx
    └── styles/
        ├── contact.module.css
        ├── home.module.css
        └── model.module.css
```

## 📊 Web Dashboard (`/web-dashboard`)
Operational command center for managing farmers and logistics.
```text
web-dashboard/
├── .env
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── App.css
    ├── App.test.tsx
    ├── App.tsx
    ├── index.css
    ├── index.tsx
    ├── logo.svg
    ├── reportWebVitals.ts
    ├── setupTests.ts
    ├── components/
    │   ├── ActivityFeed.tsx
    │   ├── CohortHealthMatrix.tsx
    │   ├── ComingSoon.tsx
    │   ├── DataTable.tsx
    │   ├── ExportButton.tsx
    │   ├── FilterPanel.tsx
    │   ├── ImpactAnalytics.tsx
    │   ├── KPICard.tsx
    │   ├── Layout.tsx
    │   ├── ModalLayout.tsx
    │   ├── RiskTracker.tsx
    │   ├── StatusBadge.tsx
    │   ├── compost/
    │   │   ├── BatchDetailModal.tsx
    │   │   ├── CompostBatchesTable.tsx
    │   │   ├── CompostLogs.tsx
    │   │   ├── CompostStats.tsx
    │   │   ├── QualityControlForm.tsx
    │   │   ├── StipendManagement.tsx
    │   │   └── SurplusSalesTracker.tsx
    │   └── orders/
    │       ├── OrderDetailModal.tsx
    │       ├── OrderDetails.tsx
    │       ├── OrderList.tsx
    │       └── OrdersTable.tsx
    ├── data/
    │   ├── mockFarmers.ts
    │   └── mockInputsSales.ts
    ├── pages/
    │   ├── CohortsPage.tsx
    │   ├── CompostPage.tsx
    │   ├── Dashboard.tsx
    │   ├── Farmers.tsx
    │   ├── FarmersPage.tsx
    │   ├── InputsSalesPage.tsx
    │   ├── MapsPage.tsx
    │   ├── OrdersPage.tsx
    │   ├── TrainingPage.tsx
    │   ├── VSLA.tsx
    │   ├── VSLAView.tsx
    │   └── WarehouseView.tsx
    ├── types/
    │   └── dashboard.types.ts
    └── utils/
        ├── api.ts
        └── formatters.ts
```

## 📱 Mobile App (`/mobile-app`)
Field agent application (Flutter).
```text
mobile-app/
├── lib/
│   └── main.dart
├── pubspec.yaml
└── pubspec.lock
```
