# GEOSPATIAL COMMAND CENTER - QUICK START GUIDE

## 🚀 Quick Setup (5 Minutes)

### Step 1: Database Migration
Open **pgAdmin** or your PostgreSQL client:
```sql
-- Copy and paste from: database/MANUAL_RUN_maps_schema.sql
-- This adds geospatial columns and creates views
```

### Step 2: Seed Geospatial Data
```bash
cd backend
node src/utils/seedMaps.js
```

### Step 3: Access Maps Page
Navigate to: **http://localhost:3000/dashboard/maps**

---

## ✅ Expected Results

After setup, you should see:
- **4 Colored Cohort Boundaries** (Green, Light Green, Blue, Light Blue)
- **100 Farmer Plot Markers** (Pink = Teen Mothers, Purple = Female Headed, Blue = Land Poor)
- **2 Warehouse Icons** (❄️ Cold Room, 🏗️ Shed)
- **1 Aggregation Center** (🚚 Truck icon)

---

## 🎯 Features to Test

1. **Search**: Type farmer name in search box
2. **Filters**: Select cohort or household type
3. **Layer Toggles**: Hide/show different layers
4. **Click Interactions**: Click any marker or boundary for details
5. **Statistics**: View summary in right sidebar

---

## 📁 Files Created

### Backend (3 files)
- `database/maps_schema.sql`
- `database/MANUAL_RUN_maps_schema.sql`
- `backend/src/utils/seedMaps.js`
- `backend/src/controllers/mapController.js`
- `backend/src/routes/maps.routes.js`

### Frontend (8 files)
- `web-dashboard/src/utils/geospatial.ts`
- `web-dashboard/src/pages/MapsPage.tsx`
- `web-dashboard/src/components/maps/MapBaseComponent.tsx`
- `web-dashboard/src/components/maps/CohortBoundaryLayer.tsx`
- `web-dashboard/src/components/maps/FarmerPlotLayer.tsx`
- `web-dashboard/src/components/maps/WarehouseLayer.tsx`

---

## 🐛 Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify leaflet CSS is imported
- Ensure backend is running on port 5000

### No data showing?
- Verify database migration ran successfully
- Check seedMaps.js completed without errors
- Test API: `curl http://localhost:5000/api/maps/stats`

### Authentication error?
- Ensure you're logged in as project_manager or agronomist role

---

## 🎨 Design Colors

- **Rwanda Blue**: `#00A1DE`
- **Sanza Gold**: `#FFD700`
- **Teen Mother**: `#E91E63` (Pink)
- **Female Headed**: `#9C27B0` (Purple)
- **Land Poor**: `#2196F3` (Blue)
