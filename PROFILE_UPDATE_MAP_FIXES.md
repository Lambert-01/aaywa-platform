# AAYWA Platform - Profile Update & Map Display Fixes

## Issues Fixed

### Issue 1: Profile Picture Not Updating on Mobile After Edit
**Problem:** When editing a farmer's profile picture on the web dashboard, the change was saved to the database but the mobile app didn't reflect the update.

**Root Cause:** 
- Mobile app wasn't refreshing profile data after returning from other screens
- No mechanism to detect when data changed on the backend

**Solution:**
1. **Web Dashboard (`FarmersPage.tsx`):**
   - Modified `handleUpdate()` to properly await the response
   - Added explicit refresh of farmers list after update
   - Ensured selected farmer detail view updates with new data

2. **Mobile App (`farmer_profile_screen.dart`):**
   - Added `didChangeDependencies()` lifecycle method
   - Profile data now reloads whenever screen becomes visible
   - Ensures fresh data is fetched from backend on every visit

**Code Changes:**

**Web Dashboard:**
```typescript
const handleUpdate = async (data: any) => {
    if (!editingFarmer) return;
    try {
        const token = localStorage.getItem('aaywa_token');
        const response = await fetch(`${API_URL}/api/farmers/${editingFarmer.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            setIsFormOpen(false);
            setEditingFarmer(null);
            
            // Refresh farmers list to show updated data
            await fetchFarmers();
            
            // Update selected farmer if detail view is open
            if (selectedFarmer && selectedFarmer.id === editingFarmer.id) {
                setSelectedFarmer(result.farmer);
            }
        }
    } catch (error) {
        console.error('Update failed', error);
    }
};
```

**Mobile App:**
```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  // Reload profile data when screen becomes visible again
  _loadProfileData();
}
```

---

### Issue 2: Map Location Data Not Displayed in Farmers Table
**Problem:** The farmers table didn't show location coordinates, making it impossible to see which farmers had their farm locations mapped.

**Root Cause:**
- Location column was missing from the table
- No parsing logic to display coordinates in readable format

**Solution:**
Added a new "Location" column to the farmers table that:
- Parses `location_coordinates` JSON field
- Displays coordinates in readable format (lat, lng)
- Shows "Not set" for farmers without location data
- Shows "Invalid" for corrupted coordinate data
- Uses monospace font for better readability

**Code Changes:**

**Table Header:**
```typescript
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    Location
</th>
```

**Table Body:**
```typescript
// Parse location coordinates
let locationDisplay = 'Not set';
if (farmer.location_coordinates) {
    try {
        const coords = typeof farmer.location_coordinates === 'string' 
            ? JSON.parse(farmer.location_coordinates) 
            : farmer.location_coordinates;
        if (coords.lat && coords.lng) {
            locationDisplay = `${parseFloat(coords.lat).toFixed(4)}, ${parseFloat(coords.lng).toFixed(4)}`;
        }
    } catch (e) {
        locationDisplay = 'Invalid';
    }
}

// Display in table
<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
    {locationDisplay}
</td>
```

---

## Testing Checklist

### Profile Picture Update Flow
- [ ] **Web Dashboard:**
  1. Open FarmersPage
  2. Click "Edit" on a farmer
  3. Upload new profile picture
  4. Click "Update Farmer Profile"
  5. Verify picture updates in table immediately
  6. Verify picture updates in detail modal if open

- [ ] **Mobile App:**
  1. Login as farmer (or view farmer profile)
  2. Note current profile picture
  3. Go to web dashboard and update picture
  4. Return to mobile app
  5. Navigate away from profile screen
  6. Navigate back to profile screen
  7. Verify new picture is displayed

### Location Display
- [ ] **Farmers Table:**
  1. Open FarmersPage
  2. Verify "Location" column is visible
  3. Check farmers with location data show coordinates
  4. Check farmers without location show "Not set"
  5. Verify coordinates are formatted as: `-1.9441, 30.0619`

---

## Data Flow Diagram

### Profile Picture Update
```
Web Dashboard                Backend                  Mobile App
     |                          |                          |
     |-- PUT /farmers/:id ----->|                          |
     |    (with photo_url)       |                          |
     |                          |-- Update DB ------------>|
     |<-- 200 OK ----------------|                          |
     |    (updated farmer)       |                          |
     |                          |                          |
     |-- Refresh List ----------|                          |
     |                          |                          |
     |                          |<-- GET /farmers/me ------|
     |                          |    (on screen focus)     |
     |                          |-- Return fresh data ---->|
     |                          |    (with new photo_url)  |
```

### Location Data Display
```
Database                    Backend                  Web Dashboard
    |                          |                          |
    |<-- SELECT farmers -------|<-- GET /farmers ---------|
    |    (with location_       |                          |
    |     coordinates)         |                          |
    |-- Return rows ---------->|-- Return JSON ---------->|
    |                          |                          |
    |                          |                          |-- Parse JSON
    |                          |                          |-- Display coords
```

---

## Database Schema

The `farmers` table stores location data as JSONB:

```sql
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    photo_url TEXT,
    location_coordinates JSONB,  -- Stores: {"lat": -1.9441, "lng": 30.0619}
    plot_size_hectares DECIMAL(10,2),
    -- ... other fields
);
```

---

## API Endpoints Used

### Update Farmer
```
PUT /api/farmers/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "full_name": "Mukamana Grace",
    "photo_url": "uploads/farmers/farmers-1234567890.jpg",
    "location_coordinates": "{\"lat\": -1.9441, \"lng\": 30.0619}",
    // ... other fields
}

Response:
{
    "message": "Farmer updated successfully",
    "farmer": { /* updated farmer object */ }
}
```

### Get Farmer Profile (Mobile)
```
GET /api/farmers/me
Authorization: Bearer <token>

Response:
{
    "id": 1,
    "full_name": "Mukamana Grace",
    "photo_url": "uploads/farmers/farmers-1234567890.jpg",
    "location_coordinates": {"lat": -1.9441, "lng": 30.0619},
    "vsla_balance": 50000,
    "total_sales": 150000,
    // ... other fields
}
```

---

## Common Issues & Solutions

### Issue: Mobile app still shows old picture
**Solution:**
1. Check network tab - is `/api/farmers/me` being called?
2. Verify response contains new `photo_url`
3. Clear app cache/data and restart
4. Check if image is cached by browser/app

### Issue: Location shows "Invalid"
**Solution:**
1. Check database - is `location_coordinates` valid JSON?
2. Verify format: `{"lat": -1.9441, "lng": 30.0619}`
3. Run SQL: `SELECT location_coordinates FROM farmers WHERE id = X;`
4. If corrupted, update: `UPDATE farmers SET location_coordinates = '{"lat": -1.9441, "lng": 30.0619}' WHERE id = X;`

### Issue: Location shows "Not set" for all farmers
**Solution:**
1. Check if farmers have been mapped using the map tool
2. Verify `location_coordinates` column exists in database
3. Check if FarmerForm is saving coordinates correctly
4. Test by manually setting coordinates in database

---

## Performance Considerations

### Mobile App Refresh
- Profile data reloads on every screen focus
- Consider adding:
  - Pull-to-refresh gesture
  - Cache with TTL (time-to-live)
  - WebSocket for real-time updates

### Location Display
- Coordinates are parsed on every render
- For large datasets, consider:
  - Memoization
  - Server-side formatting
  - Virtual scrolling

---

## Future Enhancements

1. **Real-time Updates:**
   - Implement WebSocket connection
   - Push updates to mobile app when data changes
   - Show notification when profile is updated

2. **Location Features:**
   - Click coordinates to open map view
   - Show distance from warehouse/office
   - Filter farmers by location radius

3. **Image Optimization:**
   - Generate thumbnails on upload
   - Use CDN for image delivery
   - Implement progressive image loading

4. **Offline Support:**
   - Cache profile data locally
   - Queue updates when offline
   - Sync when connection restored

---

## Files Modified

### Web Dashboard
- `src/pages/FarmersPage.tsx` - Added location column, fixed update flow

### Mobile App
- `lib/screens/profile/farmer_profile_screen.dart` - Added auto-refresh on focus

### No Backend Changes Required
- All endpoints already support the required functionality

---

## Verification Steps

1. **Start all services:**
   ```bash
   # Backend
   cd backend && npm start
   
   # Web Dashboard
   cd web-dashboard && npm start
   
   # Mobile App
   cd mobile-app && flutter run -d chrome
   ```

2. **Test profile update:**
   - Edit farmer on web
   - Check mobile app refreshes

3. **Test location display:**
   - View farmers table
   - Verify coordinates show correctly

4. **Test edge cases:**
   - Farmer with no location
   - Farmer with invalid location data
   - Farmer with no photo

---

## Support

If issues persist:
1. Check browser/mobile console for errors
2. Verify backend logs for API errors
3. Check database for data integrity
4. Test API endpoints with Postman
5. Clear all caches and restart services
