# Admin Module

## Overview

The admin module provides comprehensive administrative capabilities for managing users, apps, and system operations. It includes role-based access control, audit logging, and dashboard analytics.

## Architecture

```
src/
├── controllers/admin/
│   ├── admin.controller.ts    # Dashboard, users, audit logs
│   └── app.controller.ts      # App management
├── services/admin/
│   ├── admin.service.ts       # Core admin business logic
│   └── app.service.ts         # App management logic
├── models/admin/
│   ├── admin.model.ts         # Dashboard stats, audit logs
│   ├── user.model.ts          # User management queries
│   └── app.model.ts           # App management queries
├── routes/admin/
│   ├── index.route.ts         # Main admin router
│   ├── users.route.ts         # User management routes
│   └── apps.route.ts          # App management routes
└── middlewares/admin/
    └── admin.middleware.ts    # Auth, audit logging
```

## Access Control

### Roles

- **Staff**: Full admin access (highest privilege)
- **Developer**: Limited admin access
- **Student**: No admin access

### Middleware

```typescript
import {
  requireAdmin,
  requireStaff,
  auditLog,
} from "../middlewares/admin/admin.middleware.js";

// Require admin or staff role
router.use(requireAdmin);

// Require staff role only
router.use(requireStaff);

// Log actions for audit trail
router.get("/users", auditLog("list_users"), controller.getAllUsers);
```

## API Endpoints

### Dashboard

#### Get Dashboard Statistics

```http
GET /api/admin/dashboard/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total_users": 1250,
      "total_students": 1000,
      "total_developers": 200,
      "total_staff": 50,
      "verified_users": 980,
      "new_users_last_30_days": 145
    },
    "apps": {
      "total_apps": 75,
      "active_apps": 60,
      "inactive_apps": 15,
      "new_apps_last_30_days": 8
    },
    "verifications": {
      "total_verifications": 500,
      "pending": 25,
      "approved": 450,
      "rejected": 25
    }
  }
}
```

### User Management

#### List All Users

```http
GET /api/admin/users?page=1&limit=20&role=student&search=john&verified=true
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (`student`, `developer`, `staff`)
- `search` (optional): Search by email, first name, or last name
- `verified` (optional): Filter by verification status (`true`, `false`)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_role": "student",
      "email_verified": 1,
      "phone": "+2348012345678",
      "country": "Nigeria",
      "state": "Lagos",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20
  }
}
```

#### Get User by ID

```http
GET /api/admin/users/:userId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_role": "student",
    "institution": "UNILAG_NG",
    "matric_number": "170405012",
    "program": "B.Sc",
    "department": "Computer Science",
    "faculty": "Science",
    "admission_year": 2021,
    "graduation_year": 2025
  }
}
```

#### Verify User Email

```http
PATCH /api/admin/users/:userId/verify-email
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "User email verified successfully"
}
```

#### Update User Role

```http
PATCH /api/admin/users/:userId/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "developer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

#### Delete User

```http
DELETE /api/admin/users/:userId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### App Management

#### List All Apps

```http
GET /api/admin/apps?page=1&limit=20&status=active&search=myapp&developer_id=uuid
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`active`, `inactive`, `suspended`)
- `search` (optional): Search by app name or description
- `developer_id` (optional): Filter by developer

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "app_id": "uuid",
      "app_name": "MyApp",
      "app_description": "Description",
      "client_id": "client_123",
      "status": "active",
      "redirect_uris": "https://example.com/callback",
      "developer_id": "uuid",
      "developer_email": "dev@example.com",
      "developer_first_name": "Jane",
      "developer_last_name": "Smith",
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 75,
    "page": 1,
    "limit": 20
  }
}
```

#### Update App Status

```http
PATCH /api/admin/apps/:appId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "suspended"
}
```

**Response:**

```json
{
  "success": true,
  "message": "App status updated to suspended"
}
```

#### Regenerate App Secret

```http
POST /api/admin/apps/:appId/regenerate-secret
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "App secret regenerated successfully",
  "data": {
    "client_secret": "new_secret_here"
  }
}
```

#### Delete App

```http
DELETE /api/admin/apps/:appId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "App deleted successfully"
}
```

### Audit Logs

#### Get Audit Logs

```http
GET /api/admin/audit-logs?page=1&limit=50&admin_id=uuid&action=delete_user&resource_type=user&start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `admin_id` (optional): Filter by admin user ID
- `action` (optional): Filter by action type
- `resource_type` (optional): Filter by resource type (`user`, `app`, `dashboard`)
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "admin_id": "uuid",
      "admin_email": "admin@syncnexa.com",
      "action": "delete_user",
      "resource_type": "user",
      "resource_id": "user_uuid",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "metadata": {
        "action": "delete_user"
      },
      "created_at": "2026-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 50
  }
}
```

## Audit Logging

All admin actions are automatically logged to the `admin_audit_logs` table for security and compliance.

### Logged Information

- Admin user ID and email
- Action performed
- Resource type and ID
- IP address
- User agent
- Timestamp
- Additional metadata

### Example Usage

```typescript
import { auditLog } from "../middlewares/admin/admin.middleware.js";

router.delete("/users/:userId", auditLog("delete_user"), controller.deleteUser);
```

## Security Best Practices

1. **Always authenticate**: Use `authenticate` middleware before admin routes
2. **Require admin role**: Use `requireAdmin` or `requireStaff` middleware
3. **Audit all actions**: Use `auditLog` middleware for sensitive operations
4. **Validate input**: Always validate request parameters and body
5. **Rate limiting**: Apply stricter rate limits to admin endpoints
6. **Monitor logs**: Regularly review audit logs for suspicious activity

## Database Schema

### admin_audit_logs

```sql
CREATE TABLE admin_audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
);
```

## Future Enhancements

- [ ] Verification request management (approve/reject)
- [ ] Institution verification management
- [ ] System settings configuration
- [ ] Bulk operations (batch delete, batch verify)
- [ ] Export audit logs to CSV
- [ ] Real-time dashboard with WebSocket updates
- [ ] Email notifications for admin actions
- [ ] Advanced analytics and reporting
- [ ] Two-factor authentication for admin access
- [ ] Role-based permissions (granular access control)
