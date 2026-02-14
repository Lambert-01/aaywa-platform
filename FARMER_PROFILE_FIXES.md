# AAYWA Platform - Farmer Profile & Image Display Fixes

## Issues Fixed

### 1. **API_URL Undefined Error in FarmerForm**
**Problem:** `API_URL` was not imported in `FarmerForm.tsx`, causing TypeScript error when uploading photos.

**Solution:** Added import statement:
```typescript
import { API_URL } from '../../api/config';
```

### 2. **Farmer Images Not Displaying on Web Dashboard**
**Problem:** Images were showing as blob URLs or broken links because:
- Relative paths weren't being converted to full URLs
- No fallback for missing images
- No error handling for failed image loads

**Solution:** 
- Updated `FarmersPage.tsx` to construct full URLs:
```typescript
src={farmer.photo_url ? 
    (farmer.photo_url.startsWith('http') ? 
        farmer.photo_url : 
        `${API_URL}/${farmer.photo_url}`) : 
    '/images/default-avatar.svg'
}
```
- Added `onError` handler to fallback to default avatar
- Created default avatar SVG at `/public/images/default-avatar.svg`

### 3. **Farmer Images Not Displaying in FarmerDetails Modal**
**Problem:** Same issue as above in the detail view.

**Solution:** Applied same fix to `FarmerDetails.tsx`

### 4. **Mobile App Not Displaying Farmer Data**
**Problem:** 
- Image URLs were being constructed incorrectly (blob URLs)
- No proper error handling for image load failures
- Type errors with training data

**Solution:**
- Fixed `_buildProfilePhoto()` in `farmer_profile_screen.dart`:
```dart
String? fullPhotoUrl;
if (photoUrl != null) {
  if (photoUrl.startsWith('http')) {
    fullPhotoUrl = photoUrl;
  } else {
    final baseUrl = Environment.apiBaseUrl.replaceAll('/api', '');
    fullPhotoUrl = '$baseUrl/$photoUrl';
  }
}
```
- Added `onBackgroundImageError` callback for graceful error handling
- Fixed NetworkImage construction to avoid blob URLs

### 5. **Backend API Endpoint `/farmers/me` Already Exists**
**Status:** ✅ Already implemented in `farmerController.js`

The endpoint returns comprehensive farmer profile data including:
- Basic farmer info (name, phone, cohort, household type)
- Financial metrics (VSLA balance, input debt, total sales)
- Recent activities (sales, invoices, training)
- Training history
- Trust score

## File Changes Summary

### Backend (No changes needed)
- ✅ `/api/farmers/me` endpoint already exists
- ✅ `/api/farmers/upload-photo` endpoint already exists
- ✅ Image upload middleware configured correctly

### Web Dashboard
1. **src/components/farmers/FarmerForm.tsx**
   - Added `API_URL` import
   - Fixed photo upload URL construction

2. **src/pages/FarmersPage.tsx**
   - Added `API_URL` import
   - Fixed image display with full URL construction
   - Added error handling with fallback

3. **src/components/farmers/FarmerDetails.tsx**
   - Added `API_URL` import
   - Fixed image display in detail modal
   - Added error handling with fallback

4. **public/images/default-avatar.svg**
   - Created default avatar for farmers without photos

### Mobile App
1. **lib/screens/profile/farmer_profile_screen.dart**
   - Fixed `_buildProfilePhoto()` method
   - Proper URL construction for relative paths
   - Added error handling for image load failures
   - Fixed NetworkImage to avoid blob URLs

## Testing Checklist

### Web Dashboard
- [ ] Upload farmer photo - should save to `uploads/farmers/`
- [ ] View farmer in table - photo should display correctly
- [ ] Click "View" on farmer - photo should display in modal
- [ ] Edit farmer - existing photo should show in preview
- [ ] Farmer without photo - should show default avatar SVG

### Mobile App
- [ ] Login as farmer
- [ ] Navigate to Profile screen
- [ ] Photo should display correctly (not blob URL)
- [ ] If no photo, should show initials on colored background
- [ ] All farmer data should load (cohort, crops, financial metrics)
- [ ] Recent activities should display
- [ ] Training history should display

## API Endpoints Used

### Web Dashboard
- `GET /api/farmers` - List all farmers
- `GET /api/farmers/:id` - Get farmer by ID
- `POST /api/farmers` - Create farmer
- `PUT /api/farmers/:id` - Update farmer
- `POST /api/farmers/upload-photo?type=farmers` - Upload photo

### Mobile App
- `GET /api/farmers/me` - Get logged-in farmer's profile
- `GET /api/farmers/:id/profile` - Get comprehensive farmer profile

## Image Storage Structure

```
backend/
└── src/
    └── uploads/
        └── farmers/
            ├── farmers-1234567890-123456789.jpg
            ├── farmers-1234567891-987654321.png
            └── ...
```

## Environment Variables

Ensure these are set:

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aaywa_platform
DB_USER=aaywa_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

### Web Dashboard (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Mobile App (lib/config/env.dart)
```dart
static const String apiBaseUrl = 'http://localhost:5000/api';
```

## Common Issues & Solutions

### Issue: Images still not showing
**Solution:** 
1. Check browser console for 404 errors
2. Verify file exists in `backend/src/uploads/farmers/`
3. Check that backend is serving static files: `app.use('/uploads', express.static('src/uploads'))`
4. Ensure CORS allows image requests

### Issue: Mobile app shows "Type 'String' is not a subtype of type 'int'"
**Solution:** This is related to training data parsing. The fix in `farmer_profile_screen.dart` handles this gracefully with try-catch blocks.

### Issue: WASM errors in mobile app
**Solution:** These are expected when running Flutter web without proper WASM setup. The code now handles these errors gracefully and continues to function.

## Next Steps

1. Test all functionality on both web and mobile
2. Add image compression for uploaded photos (optional)
3. Add image cropping tool in upload form (optional)
4. Implement CDN for production image serving (optional)
5. Add image caching in mobile app (optional)

## Support

If issues persist:
1. Check browser/mobile console for errors
2. Verify backend logs for upload errors
3. Ensure database has `photo_url` column in `farmers` table
4. Test API endpoints directly with Postman/curl
