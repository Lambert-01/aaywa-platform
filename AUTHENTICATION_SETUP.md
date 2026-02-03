# Authentication System Guide (Email/Password)

## Overview

The authentication system has been refactored to use **Email & Password** for internal staff access to the **Web Dashboard**. 

> 🔒 **Strict Access Control**: Buyers/Customers **NEVER** access the dashboard. They rely solely on the public website (Guest checkout).

## Roles & Permissions

| Role | Access | Authentication | Key Permissions |
|------|--------|----------------|-----------------|
| **project_manager** | Dashboard | Email + Password | Full System Access (CRUD) |
| **agronomist** | Dashboard | Email + Password | Manage Farmers, Cohorts, Inputs, Maps |
| **field_facilitator** | Dashboard | Email + Password | Manage Farmers, Training, VSLA |
| **buyer** | **Website Only** | **None (Guest)** | Browse & Buy Products |

---

## Backend Setup (PostgreSQL)

### 1. Database Schema
The `users` table supports email/password authentication:
- `email`: Unique, required
- `password_hash`: Bcrypt hashed password
- `role`: Enum ('project_manager', 'agronomist', 'field_facilitator')

### 2. Environment Variables (.env)
Ensure your `.env` is configured:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aaywa_platform
DB_USER=aaywa_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secure_secret_min_32_chars
JWT_EXPIRES_IN=86400

# Security (Bcrypt)
BCRYPT_SALT_ROUNDS=12
```

### 3. API Endpoints

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "secret_password" }`
- **Response**: JWT Token + User Profile

#### Register (Admin Only)
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ "full_name": "...", "email": "...", "password": "...", "role": "..." }`

---

## Frontend Setup (Web Dashboard)

### 1. Login Page
Located at `/login`. Features:
- Email/Password inputs
- Remember Me checkbox
- Strict validation

### 2. Protected Routes
Routes are guarded by `ProtectedRoute.tsx`:
- Checks for valid JWT token
- Verifies user role matches allowed roles for the route
- Redirects unauthorized users to `/login`

---

## Testing the Flow

1. **Start Backend**: `npm start` (Port 5000)
2. **Start Dashboard**: `npm start` (Port 8000)
3. **Login**: Use credentials of a registered staff member.
   - *Note*: If you don't have a user, manually insert one into the DB using SQL or use the registration endpoint with a temporary token (or disable auth middleware temporarily to create the first admin).

### Creating First Admin (SQL)
```sql
INSERT INTO users (full_name, email, password_hash, role, is_active)
VALUES ('System Admin', 'admin@aaywa.rw', '$2a$12$R9...', 'project_manager', true);
-- Note: Generate a real bcrypt hash for the password first!
```

---

## Security Notes
- **HTTPS**: Enforce in production.
- **Passwords**: Never stored in plain text.
- **Tokens**: Stored in LocalStorage (client-side).
- **Access**: "Buyer" role is purely logical for the database but has NO login privileges.
