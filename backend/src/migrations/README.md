# Database Migrations

## How to Run Migrations

### Using psql (PostgreSQL command-line)

```bash
# Connect to your database
psql -U postgres -d aaywa_db

# Run migrations in order
\i src/migrations/001_create_users_table.sql
\i src/migrations/002_create_otp_table.sql

# Verify tables were created
\dt
\d users
\d otp_codes
```

### Using Node.js script (optional)

```bash
node src/migrations/runMigrations.js
```

## Migration Order

1. **001_create_users_table.sql** - User accounts with authentication
2. **002_create_otp_table.sql** - OTP codes for phone verification

## Important Notes

- **Production**: Remove `DROP TABLE IF EXISTS` statements before running in production
- **Default Admin**: Change the default admin password immediately after first migration
- **Backup**: Always backup database before running migrations in production

## Rollback Instructions

```sql
-- Rollback users table
DROP TABLE IF EXISTS users CASCADE;

-- Rollback OTP table
DROP TABLE IF EXISTS otp_codes CASCADE;
```

## Default Admin Credentials

**Phone**: +250788000000  
**Password**: AdminPass123!  

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN**
