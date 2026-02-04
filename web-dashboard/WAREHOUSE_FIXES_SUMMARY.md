# Warehouse Map & Facility Creation Fixes

## Summary of Changes

This document summarizes the fixes made to resolve issues with facility creation and map display in the warehouse management system.

## Issues Identified

1. **Facility Details Modal Not Opening**: The `onViewDetails` handler in [`WarehouseView.tsx`](web-dashboard/src/pages/WarehouseView.tsx:216) was only logging to console instead of opening the facility details modal.

2. **API Error Handling**: The API utility in [`api.ts`](web-dashboard/src/utils/api.ts:45) was not properly handling backend error responses that use the `error` field instead of `message`.

3. **Insufficient Error Logging**: Several components lacked proper console logging for debugging facility creation and transaction recording issues.

## Files Modified

### 1. [`web-dashboard/src/pages/WarehouseView.tsx`](web-dashboard/src/pages/WarehouseView.tsx)

**Changes:**
- Fixed `onViewDetails` handler to properly open facility details modal by connecting it to `handleFacilityClick` function
- Added comprehensive console logging to `handleCreateFacility`, `handleRecordIncoming`, and `handleRecordOutgoing` functions
- Improved error handling to properly extract and display error messages from backend responses
- Added logging to `fetchFacilities` to help debug data fetching issues

**Before:**
```typescript
onViewDetails={(facility) => console.log('View facility:', facility)}
```

**After:**
```typescript
onViewDetails={handleFacilityClick}
```

### 2. [`web-dashboard/src/utils/api.ts`](web-dashboard/src/utils/api.ts)

**Changes:**
- Updated error handling to check for both `errorData.error` and `errorData.message` fields
- Updated `handleApiError` function to handle both error formats

**Before:**
```typescript
throw new Error(
    errorData.message || `API Error: ${response.status} ${response.statusText}`
);
```

**After:**
```typescript
throw new Error(
    errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`
);
```

### 3. [`web-dashboard/src/components/warehouse/FacilityCreationModal.tsx`](web-dashboard/src/components/warehouse/FacilityCreationModal.tsx)

**Changes:**
- Added console logging to track data being submitted
- Improved error handling to properly extract error messages from multiple possible sources
- Added better error message extraction from `err.response?.data?.error`, `err.message`, and `err.error`

### 4. [`web-dashboard/src/components/warehouse/RecordIncomingModal.tsx`](web-dashboard/src/components/warehouse/RecordIncomingModal.tsx)

**Changes:**
- Added console logging to track incoming produce recording
- Improved error handling with proper error message extraction
- Added alert to display error messages to users

### 5. [`web-dashboard/src/components/warehouse/RecordOutgoingModal.tsx`](web-dashboard/src/components/warehouse/RecordOutgoingModal.tsx)

**Changes:**
- Added console logging to track outgoing shipment recording
- Improved error handling with proper error message extraction
- Added alert to display error messages to users

## How the System Works

### Facility Creation Flow

1. User clicks "Create Facility" button in [`WarehouseView.tsx`](web-dashboard/src/pages/WarehouseView.tsx:165)
2. [`FacilityCreationModal`](web-dashboard/src/components/warehouse/FacilityCreationModal.tsx:35) opens with interactive map
3. User clicks on map to set GPS coordinates (lat/lng)
4. User fills in facility details (name, type, capacity, etc.)
5. On submit, data is sent to backend via `POST /api/warehouses/facilities`
6. Backend validates coordinates are within Rwanda bounds
7. Backend saves facility to `storage_facilities` table with `location_lat` and `location_lng`
8. Frontend refreshes facilities list
9. [`WarehouseMapDashboard`](web-dashboard/src/components/warehouse/WarehouseMapDashboard.tsx:34) displays facility on map with marker

### Map Display Logic

The [`WarehouseMapDashboard`](web-dashboard/src/components/warehouse/WarehouseMapDashboard.tsx:34) component:
- Filters facilities to only include those with valid coordinates (`location_lat` and `location_lng` not null/NaN)
- Calculates map center from facility coordinates or defaults to Kigali, Rwanda
- Creates custom markers with facility type icons (❄️ for cold room, 🏗️ for shed, 📦 for ambient)
- Shows popup with facility details when marker is clicked
- Displays legend showing facility types

## Testing Instructions

### Test 1: Create Facility with Map Coordinates

1. Navigate to Warehouse View
2. Click "Create Facility" button
3. Click anywhere on the map to set location
4. Fill in required fields:
   - Facility Name: "Test Cold Room"
   - Facility Type: "Cold Room"
   - Storage Capacity: "500"
5. Click "Create Facility"
6. **Expected Result**: Facility is created and appears on the map with a marker

### Test 2: View Facility Details

1. Click on any facility marker on the map
2. Click "View Details" button in the popup
3. **Expected Result**: Facility details modal opens showing all facility information

### Test 3: View Facility Details from Table

1. Scroll to "Storage Facilities" table
2. Click "View Details" button for any facility
3. **Expected Result**: Facility details modal opens showing all facility information

### Test 4: Verify Coordinates are Saved

1. Create a facility with specific coordinates (e.g., lat: -1.9441, lng: 30.0619)
2. After creation, check browser console for "Fetched facilities:" log
3. Verify the facility object contains the correct `location_lat` and `location_lng` values
4. **Expected Result**: Coordinates are saved and displayed correctly

## Backend Validation

The backend ([`warehouseController.js`](backend/src/controllers/warehouseController.js:23)) validates:
- Required fields: `name`, `type`, `capacityKg`, `locationLat`, `locationLng`
- Coordinates must be within Rwanda bounds:
  - Latitude: -2.9 to -1.0
  - Longitude: 28.8 to 30.9

## Database Schema

The `storage_facilities` table ([`warehouse_schema.sql`](database/warehouse_schema.sql:6) stores:
- `location_lat` (DECIMAL(10,8)) - Latitude coordinate
- `location_lng` (DECIMAL(11,8)) - Longitude coordinate
- Other facility details (name, type, capacity, etc.)

## Troubleshooting

If facilities are not appearing on the map:

1. **Check Browser Console**: Look for "Fetched facilities:" log to see what data is being returned
2. **Check Network Tab**: Verify the API call to `/api/warehouses/facilities` is successful
3. **Verify Coordinates**: Ensure facilities have valid `location_lat` and `location_lng` values (not null/NaN)
4. **Check Authentication**: Ensure you're logged in with appropriate role (agronomist or project_manager)
5. **Check Backend Logs**: Look for any errors in the backend console

## Next Steps

The system is now configured to:
- ✅ Create facilities with map coordinates
- ✅ Display facilities on the interactive map
- ✅ Show facility details when clicking markers or table rows
- ✅ Provide clear error messages for debugging
- ✅ Log all operations for troubleshooting

All changes maintain backward compatibility and don't affect existing functionality.
