# API Reference — User Profile (SAuth 1.0)

## Endpoint

```
GET /api/v1/user/profile
```

Fetches the authenticated user's profile information (requires SAuth 1.0 access token).

## Request

```http
GET /api/v1/user/profile
Authorization: Bearer {ACCESS_TOKEN}
```

### Parameters

| Parameter       | Location | Required | Description                      |
| --------------- | -------- | -------- | -------------------------------- |
| `Authorization` | Header   | Yes      | Bearer token from `/sauth/token` |

## Response

```json
{
  "id": "user-123",
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "role": "student",
  "avatar": "https://...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Response Fields

| Field         | Type   | Description                            |
| ------------- | ------ | -------------------------------------- |
| `id`          | string | Unique user identifier                 |
| `email`       | string | User email address                     |
| `firstName`   | string | First name                             |
| `lastName`    | string | Last name                              |
| `displayName` | string | Full display name                      |
| `role`        | string | User role (e.g., `student`, `teacher`) |
| `avatar`      | string | Avatar URL (may be null)               |
| `createdAt`   | string | Account creation timestamp (ISO 8601)  |

## Error Responses

### 401 Unauthorized

```json
{
  "error": "invalid_token",
  "error_description": "Access token is missing, invalid, or expired"
}
```

### 403 Forbidden

```json
{
  "error": "insufficient_scope",
  "error_description": "Token does not have 'profile' scope"
}
```

## Example (JavaScript)

```javascript
const token = getAccessToken(); // from token exchange

const response = await fetch("http://localhost:3000/api/v1/user/profile", {
  headers: { Authorization: `Bearer ${token}` },
});

const user = await response.json();
console.log(user.displayName);
```

## Next Steps

→ [Token Management](../auth/token-management) — Handle token expiration  
→ [Quick Start](../getting-started/quick-start) — Full implementation guide
