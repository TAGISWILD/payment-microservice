# How to View Heroku PostgreSQL Database Tables

## Method 1: Heroku Dashboard (Easiest - No Installation)

1. Go to: https://dashboard.heroku.com/apps/payment-microservice-a/data
2. Click on your PostgreSQL database
3. Click "View Data" or "Data" tab
4. You'll see all tables and can browse data

## Method 2: Install PostgreSQL Client (psql)

### Windows (using Chocolatey):
```powershell
choco install postgresql
```

### Windows (using installer):
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL
3. Add to PATH

### Then use:
```powershell
# Connect to database
heroku pg:psql --app payment-microservice-a

# Once connected, run:
\dt                    # List all tables
\d payment_orders      # Describe payment_orders table
SELECT * FROM payment_orders LIMIT 10;  # View data
\q                     # Quit
```

## Method 3: Database GUI Tools (Recommended)

### Option A: pgAdmin (Free)
1. Download: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click "Servers" → "Create" → "Server"
4. Connection details:
   - **Host**: `c7itisjfjj8ril.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`
   - **Database**: `d9n1id0tsmntq0`
   - **Username**: `u6i2dg2a22v95b`
   - **Password**: `p01e2bd10a615f042c010b7d00dafec01fffce32751d030478f8ea8b160fe4ee0`
5. Click "Save" and browse tables

### Option B: DBeaver (Free, Cross-platform)
1. Download: https://dbeaver.io/download/
2. Install and open DBeaver
3. Click "New Database Connection" → PostgreSQL
4. Use same connection details as above
5. Browse tables in left sidebar

### Option C: TablePlus (Paid, Beautiful UI)
1. Download: https://tableplus.com/
2. Create new PostgreSQL connection
3. Use connection details above
4. Browse tables

### Option D: DataGrip (JetBrains - Paid)
1. Download: https://www.jetbrains.com/datagrip/
2. Create PostgreSQL data source
3. Use connection details above

## Method 4: VS Code Extension

1. Install "PostgreSQL" extension by Chris Kolkman
2. Add connection:
   - Host: `c7itisjfjj8ril.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `d9n1id0tsmntq0`
   - Username: `u6i2dg2a22v95b`
   - Password: `p01e2bd10a615f042c010b7d00dafec01fffce32751d030478f8ea8b160fe4ee0`
3. Browse tables in sidebar

## Method 5: Online SQL Query Tool

### Option A: Adminer (Web-based)
1. Deploy Adminer to Heroku or use: https://www.adminer.org/
2. Connect using connection string

### Option B: SQLPad (Self-hosted)
1. Deploy SQLPad
2. Connect to your database

## Quick SQL Queries to View Tables

Once connected, you can run:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- View payment_orders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_orders';

-- View all payment orders
SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 20;

-- View all payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 20;

-- View webhook events
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 20;

-- Count records in each table
SELECT 
  'payment_orders' as table_name, COUNT(*) as count FROM payment_orders
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'refunds', COUNT(*) FROM refunds
UNION ALL
SELECT 'webhook_events', COUNT(*) FROM webhook_events
UNION ALL
SELECT 'api_clients', COUNT(*) FROM api_clients;
```

## Your Database Tables

Based on your schema, you should have:
1. **api_clients** - API client credentials
2. **payment_orders** - Payment orders created
3. **payments** - Payment records
4. **refunds** - Refund records
5. **webhook_events** - Webhook events from Razorpay

## Connection String Format

If using a tool that needs connection string:
```
postgres://u6i2dg2a22v95b:p01e2bd10a615f042c010b7d00dafec01fffce32751d030478f8ea8b160fe4ee0@c7itisjfjj8ril.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d9n1id0tsmntq0
```

## Security Note

⚠️ **Important**: The password above is sensitive. Don't share it publicly. Consider rotating it if exposed.

To rotate password:
```powershell
heroku pg:credentials:rotate --app payment-microservice-a
```

