# Seed Scripts

This directory contains database seeding scripts for initial setup and testing.

## Available Scripts

### Create Super Admin

Creates the platform super-admin user with access to all workspaces.

**Command:**

```bash
npm run seed:superadmin
```

**Environment Variables:**

```env
SUPER_ADMIN_EMAIL=admin@teamsync.com
SUPER_ADMIN_PASSWORD=Admin123!@#
```

**Default Credentials (if not in .env):**

- Email: `admin@teamsync.com`
- Password: `Admin123!@#`

**Features:**

- Creates a user with `isSuperAdmin: true`
- Checks for existing super-admin to prevent duplicates
- Hashes password automatically via User model pre-save hook
- Displays created credentials for reference

**Security Notes:**

- ⚠️ Change the password immediately after first login
- ⚠️ Use strong, unique passwords in production
- ⚠️ Never commit the actual `.env` file to version control
- ⚠️ Store super-admin credentials securely (password manager)

## Usage

1. Configure credentials in `.env` file:

   ```bash
   SUPER_ADMIN_EMAIL=your-email@domain.com
   SUPER_ADMIN_PASSWORD=YourStrongPassword123!
   ```

2. Run the seed script:

   ```bash
   npm run seed:superadmin
   ```

3. The script will:
   - Connect to MongoDB
   - Check if super-admin exists
   - Create new super-admin if none exists
   - Display the credentials
   - Exit

4. Save the credentials securely and change the password on first login.

## Troubleshooting

**Error: "Super-admin already exists"**

- A super-admin user already exists in the database
- To create a new one, delete the existing super-admin or use a different email

**Error: "Connection failed"**

- Check your `MONGODB_URI` in `.env` file
- Ensure MongoDB is running and accessible
- Verify network connection

**Error: "Validation failed"**

- Check that email format is valid
- Ensure password meets requirements (min 8 characters)
- Verify firstName and lastName are provided
