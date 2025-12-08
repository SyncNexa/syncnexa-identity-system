# App Management API

Complete reference for managing your registered apps via API.

## Endpoints Overview

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/v1/apps/register`      | Register a new app           |
| GET    | `/api/v1/apps/my-apps`       | List all your apps           |
| GET    | `/api/v1/apps/:id`           | Get specific app details     |
| PATCH  | `/api/v1/apps/:id`           | Update app details           |
| POST   | `/api/v1/apps/rotate-secret` | Rotate client secret         |
| DELETE | `/api/v1/apps/:id`           | Delete an app                |
| GET    | `/api/v1/apps/available`     | List publicly available apps |

## Authentication

All endpoints require authentication via Bearer token:

```http
Authorization: Bearer {your_jwt_token}
```

Get your token by logging in at `/api/v1/auth/login`.

## Register an App

```http
POST /api/v1/apps/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My App",
  "description": "App description (optional)",
  "website_url": "https://myapp.com (optional)",
  "callback_url": "https://myapp.com/auth/callback",
  "scopes": ["profile", "student:profile"] (optional, defaults to ["profile"])
}
```

**Validation:**

- `name`: 3-100 characters, required
- `description`: max 500 characters, optional
- `website_url`: valid URL, optional
- `callback_url`: valid URL, required
- `scopes`: array of valid scopes, optional

**Response (201):**

```json
{
  "status": "success",
  "message": "App registered successfully.",
  "data": {
    "id": "app_abc123",
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_secret": "a1b2c3...xyz",
    "name": "My App",
    "description": "App description",
    "website_url": "https://myapp.com",
    "callback_url": "https://myapp.com/auth/callback",
    "scopes": ["profile", "student:profile"],
    "owner_id": "user_123",
    "status": "active",
    "created_at": "2025-12-08T10:00:00Z"
  }
}
```

⚠️ **client_secret is only shown once!** Save it immediately.

## List Your Apps

```http
GET /api/v1/apps/my-apps
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Apps retrieved successfully",
  "data": [
    {
      "id": "app_abc123",
      "client_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My App",
      "description": "App description",
      "website_url": "https://myapp.com",
      "callback_url": "https://myapp.com/auth/callback",
      "scopes": ["profile", "student:profile"],
      "status": "active",
      "created_at": "2025-12-08T10:00:00Z"
    }
  ]
}
```

Note: `client_secret` is never returned after registration.

## Get App by ID

```http
GET /api/v1/apps/:id
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "App retrieved successfully",
  "data": {
    "id": "app_abc123",
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My App",
    "description": "App description",
    "website_url": "https://myapp.com",
    "callback_url": "https://myapp.com/auth/callback",
    "scopes": ["profile", "student:profile"],
    "status": "active",
    "created_at": "2025-12-08T10:00:00Z"
  }
}
```

**Errors:**

- `400`: App not found or you don't have access

## Update an App

```http
PATCH /api/v1/apps/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated App Name",
  "description": "New description",
  "website_url": "https://newurl.com",
  "callback_url": "https://newurl.com/auth/callback",
  "status": "active" | "inactive" | "suspended"
}
```

All fields are optional. Only include fields you want to update.

**Validation:**

- `name`: 3-100 characters if provided
- `description`: max 500 characters
- `website_url`: valid URL
- `callback_url`: valid URL
- `status`: one of "active", "inactive", "suspended"

**Response (200):**

```json
{
  "status": "success",
  "message": "App updated successfully.",
  "data": {
    "id": "app_abc123",
    "name": "Updated App Name",
    ...
  }
}
```

## Rotate Client Secret

If your client secret is compromised or needs rotation:

```http
POST /api/v1/apps/rotate-secret
Authorization: Bearer {token}
Content-Type: application/json

{
  "app_id": "app_abc123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Client secret rotated successfully.",
  "data": {
    "client_secret": "new_secret_xyz789"
  }
}
```

⚠️ **Old secret is immediately invalidated!** Update your environment variables right away.

## Delete an App

Permanently delete an app and revoke all user authorizations:

```http
DELETE /api/v1/apps/:id
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "App deleted successfully."
}
```

⚠️ **This action cannot be undone!** All users will lose access immediately.

## List Available Apps

Get a list of all publicly available apps (for discovery):

```http
GET /api/v1/apps/available
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Available apps retrieved successfully",
  "data": [
    {
      "id": "app_xyz",
      "name": "Public App",
      "slug": "public-app",
      "website_url": "https://publicapp.com",
      "logo_url": "https://cdn.com/logo.png",
      "scopes": ["profile"]
    }
  ]
}
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "name",
      "message": "App name must be at least 3 characters"
    }
  ]
}
```

**Common Status Codes:**

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Next Steps

→ [App Registration](./app-registration) — Full registration guide  
→ [SAuth Flow](../auth/oauth-flow) — Implement authorization  
→ [Quick Start](./quick-start) — Complete integration example
