# Database Setup Commands

## PostgreSQL Database Creation

If you haven't created the database yet:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_app_db;

# Create user (if needed)
CREATE USER your_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE your_app_db TO your_user;

# Exit
\q
```

## Update .env in server folder

```bash
# Make sure DATABASE_URL is set in server/.env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_app_db
JWT_SECRET=your_jwt_secret_key_here
```

## Drizzle ORM Commands

### Option 1: Using npm scripts (if available)

```bash
cd server

# Generate and apply migrations
npm run db:generate
npm run db:push

# View database studio
npm run db:studio
```

### Option 2: Direct commands

```bash
cd server

# Install if not already installed
npm install drizzle-orm drizzle-kit postgres

# Generate migration
npx drizzle-kit generate:postgres

# Apply migration
npx drizzle-kit push:postgres

# Studio - visual database manager
npx drizzle-kit studio
```

## Complete Setup Steps

```bash
# 1. Navigate to server
cd server

# 2. Install dependencies
npm install

# 3. Create .env file with DATABASE_URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/dbname" > .env
echo "JWT_SECRET=your_secret_key" >> .env

# 4. Apply schema to database
npx drizzle-kit push:postgres

# 5. Verify schema (open Drizzle Studio)
npx drizzle-kit studio

# 6. Start server
npm start
```

## Verify Schema Was Created

### Option 1: Using psql

```bash
# Connect to database
psql -U postgres -d your_app_db

# List tables
\dt

# Describe enquiries table
\d enquiries

# See all columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'enquiries';

# Exit
\q
```

### Option 2: Using Drizzle Studio

```bash
cd server
npx drizzle-kit studio

# Opens browser UI at localhost:8080
# You can see/manage tables visually
```

## Sample Queries to Test

### Insert test data

```sql
INSERT INTO enquiries (
    enquiry_number, user_id, customer_name, mobile_number,
    product_name, product_cost, enquiry_date, enquiry_taken_by,
    enquiry_status, enquiry_type, lead_source, payment_method,
    follow_up_required
) VALUES (
    'ENQ001', 1, 'John Doe', '9876543210',
    'Laptop', '50000', '2025-01-20', 'Agent A',
    'New', 'Product Inquiry', 'Walk-in', 'Cash', 'No'
);
```

### View all enquiries

```sql
SELECT * FROM enquiries;
```

### View specific user's enquiries

```sql
SELECT * FROM enquiries WHERE user_id = 1;
```

### Update enquiry

```sql
UPDATE enquiries
SET enquiry_status = 'Interested'
WHERE enquiry_number = 'ENQ001';
```

### Delete enquiry

```sql
DELETE FROM enquiries WHERE enquiry_number = 'ENQ001';
```

## Troubleshooting

### Error: "Connection refused"

```bash
# Make sure PostgreSQL service is running

# Windows
net start postgresql-x64-14  # or your version

# Mac
brew services start postgresql

# Linux
sudo service postgresql start
```

### Error: "Database does not exist"

```bash
# Create database through psql
psql -U postgres -c "CREATE DATABASE your_app_db;"
```

### Error: "User does not exist"

```bash
# Create user through psql
psql -U postgres -c "CREATE USER your_user WITH PASSWORD 'password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE your_app_db TO your_user;"
```

### Error: "Column does not exist"

```bash
# Run migration again
npx drizzle-kit push:postgres --force
```

### Error: "ENOENT: no such file"

```bash
# Make sure you're in the server directory
cd server
ls -la  # Check if drizzle.config.ts exists
```

## Database Backup & Restore

### Backup

```bash
# Create backup
pg_dump -U postgres your_app_db > backup.sql

# Or with password
PGPASSWORD=password pg_dump -U user your_app_db > backup.sql
```

### Restore

```bash
# Restore from backup
psql -U postgres your_app_db < backup.sql

# Or with password
PGPASSWORD=password psql -U user your_app_db < backup.sql
```

## Check Drizzle Configuration

Make sure `server/drizzle.config.ts` exists and looks like:

```typescript
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/db/schema.js",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
} satisfies Config;
```

## Environment Variables Check

In `server/.env`, you should have:

```
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
JWT_SECRET=your_secret_key_minimum_32_characters_recommended
PORT=5000
NODE_ENV=development
```

## Success Checklist

-   [ ] PostgreSQL installed and running
-   [ ] Database created
-   [ ] `.env` file has DATABASE_URL
-   [ ] `npm install` completed in server
-   [ ] `npx drizzle-kit push:postgres` ran successfully
-   [ ] Tables appear in `\dt` command
-   [ ] Server starts without database errors
-   [ ] Can insert test data with sample query
-   [ ] Mobile app can create enquiry (shows in DB)

## Additional Resources

-   [PostgreSQL Documentation](https://www.postgresql.org/docs/)
-   [Drizzle ORM Docs](https://orm.drizzle.team/)
-   [Drizzle Kit Reference](https://orm.drizzle.team/kit-docs/overview)
-   [Postgres.js Client](https://github.com/porsager/postgres)

---

**All set!** Your database is ready to store enquiry data. 🎉
