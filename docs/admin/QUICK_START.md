# Admin Module - Quick Start Guide

## Setup

### 1. Run Migration

```bash
# Apply the admin audit logs migration
mysql -u root -p identity_db < migrations/0025_create_admin_audit_logs.sql
```

### 2. Create Admin User

You need a user with `staff` or `developer` role to access admin endpoints.

```sql
-- Update existing user to staff role
UPDATE users SET user_role = 'staff' WHERE email = 'admin@syncnexa.com';

-- Or create new staff user via API with role='staff'
```

### 3. Get Admin Access Token

```bash
# Login as admin user
curl -X POST http://localhost:4333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@syncnexa.com",
    "password": "your_password"
  }'

# Save the access_token from response
```

## Common Operations

### View Dashboard Stats

```bash
curl http://localhost:4333/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List All Users

```bash
# Get first page of users
curl "http://localhost:4333/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search for specific user
curl "http://localhost:4333/api/admin/users?search=john" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by role
curl "http://localhost:4333/api/admin/users?role=student" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User Details

```bash
curl http://localhost:4333/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify User Email

```bash
curl -X PATCH http://localhost:4333/api/admin/users/USER_ID/verify-email \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update User Role

```bash
curl -X PATCH http://localhost:4333/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "developer"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:4333/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List All Apps

```bash
# Get all apps
curl "http://localhost:4333/api/admin/apps?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by status
curl "http://localhost:4333/api/admin/apps?status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by developer
curl "http://localhost:4333/api/admin/apps?developer_id=DEVELOPER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update App Status

```bash
# Suspend app
curl -X PATCH http://localhost:4333/api/admin/apps/APP_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'

# Reactivate app
curl -X PATCH http://localhost:4333/api/admin/apps/APP_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Regenerate App Secret

```bash
curl -X POST http://localhost:4333/api/admin/apps/APP_ID/regenerate-secret \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete App

```bash
curl -X DELETE http://localhost:4333/api/admin/apps/APP_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### View Audit Logs

```bash
# Get recent audit logs
curl "http://localhost:4333/api/admin/audit-logs?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by admin
curl "http://localhost:4333/api/admin/audit-logs?admin_id=ADMIN_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by action
curl "http://localhost:4333/api/admin/audit-logs?action=delete_user" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by date range
curl "http://localhost:4333/api/admin/audit-logs?start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Testing

### Run Tests

```bash
# Install dependencies if not done
npm install

# Run admin module tests (create tests first)
npm test -- --grep "Admin"
```

### Manual Testing with Postman

1. Import the API collection (create one with the endpoints above)
2. Set environment variable: `ACCESS_TOKEN`
3. Test each endpoint systematically

## Troubleshooting

### "Authentication required"

- Make sure you're sending the `Authorization: Bearer TOKEN` header
- Verify your token hasn't expired (15 min default)

### "Access denied. Admin privileges required."

- Your user role must be `staff` or `developer`
- Check: `SELECT user_role FROM users WHERE email = 'your@email.com'`

### "User not found" / "App not found"

- Verify the ID exists in the database
- IDs are UUIDs, not sequential numbers

### Audit logs not appearing

- Check that the middleware is applied: `auditLog("action_name")`
- Verify the `admin_audit_logs` table exists
- Check for database errors in logs

## Development

### Adding New Admin Endpoints

1. **Create model function** in `src/models/admin/`
2. **Create service function** in `src/services/admin/`
3. **Create controller** in `src/controllers/admin/`
4. **Add route** in `src/routes/admin/`
5. **Apply middleware**: `authenticate`, `requireAdmin`, `auditLog`

Example:

```typescript
// Route
router.post(
  "/users/:userId/suspend",
  authenticate,
  requireAdmin,
  auditLog("suspend_user"),
  controller.suspendUser,
);
```

### Best Practices

- Always use transactions for multi-table operations
- Include pagination for list endpoints
- Log sensitive operations with `auditLog`
- Validate input with Zod schemas
- Return consistent response format
- Handle errors gracefully with try-catch
- Test edge cases (missing IDs, invalid roles, etc.)

## Production Considerations

1. **Rate Limiting**: Apply stricter limits to admin endpoints
2. **IP Whitelisting**: Restrict admin access to specific IPs
3. **MFA**: Require two-factor authentication for admin users
4. **Session Timeout**: Use shorter token expiration for admin
5. **Monitoring**: Alert on suspicious admin activity
6. **Backup**: Regular backups of audit logs
7. **HTTPS**: Always use HTTPS in production
8. **Secrets**: Rotate admin credentials regularly
