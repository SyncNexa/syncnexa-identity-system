# Get Current User Info - `/me`

## Overview

The `/user/me` endpoint retrieves minimal information about the authenticated user. This endpoint is designed for quickly accessing essential user details like name, role, profile image, email, and account status.

This endpoint is useful for:

- Displaying user information in the UI
- Verifying user's current role and account status
- Loading user profile pictures
- Building user menus or authentication flows

## Endpoint Details

| Property           | Value                   |
| ------------------ | ----------------------- |
| **HTTP Method**    | GET                     |
| **URL**            | `/user/me`              |
| **Authentication** | Required (Bearer Token) |
| **Authorization**  | All authenticated roles |
| **Content Type**   | application/json        |

## Request

### Headers

```http
Authorization: Bearer <access_token>
```

### Parameters

No parameters required.

## Response

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User info retrieved",
  "data": {
    "fullName": "John Doe",
    "role": "student",
    "profileImage": "https://storage.example.com/profiles/user123.jpg",
    "email": "john@example.com",
    "accountStatus": "active"
  },
  "errors": null
}
```

### Response Fields

| Field           | Type           | Description                                             |
| --------------- | -------------- | ------------------------------------------------------- |
| `fullName`      | string         | User's full name (first name + last name)               |
| `role`          | string         | User's role (student, developer, staff, admin, etc.)    |
| `profileImage`  | string \| null | URL to user's profile image, or null if not set         |
| `email`         | string         | User's email address                                    |
| `accountStatus` | string         | Account status: "active", "suspended", or "deactivated" |

### Error Response (4xx/5xx)

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "User not found",
  "data": null,
  "errors": null
}
```

## Common Error Codes

| Code | Message                   | Cause                             |
| ---- | ------------------------- | --------------------------------- |
| 400  | user_id required          | User ID missing from token        |
| 404  | User not found            | User no longer exists in database |
| 401  | Unauthorized              | Invalid or expired token          |
| 500  | Could not fetch user info | Server error                      |

## Code Examples

### JavaScript (Node.js)

#### Using Fetch API

```javascript
async function getCurrentUserInfo() {
  try {
    const response = await fetch("https://api.syncnexa.com/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("User Info:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

// Usage
const userInfo = await getCurrentUserInfo();
console.log(`${userInfo.fullName} (${userInfo.role})`);
```

#### Using Axios

```javascript
const axios = require("axios");

async function getCurrentUserInfo() {
  try {
    const response = await axios.get("https://api.syncnexa.com/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
const userInfo = await getCurrentUserInfo();
if (userInfo.accountStatus !== "active") {
  console.warn("Account is not active");
}
```

### cURL

```bash
curl -X GET 'https://api.syncnexa.com/user/me' \
  -H 'Authorization: Bearer access_token_here' \
  -H 'Content-Type: application/json'
```

### Python

#### Using requests

```python
import requests

def get_current_user_info(access_token):
    url = 'https://api.syncnexa.com/user/me'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        result = response.json()
        return result['data']
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
        raise

# Usage
user_info = get_current_user_info(access_token)
print(f"User: {user_info['fullName']}")
print(f"Role: {user_info['role']}")
print(f"Status: {user_info['accountStatus']}")
```

## Use Cases

### 1. Display User Profile Menu

```javascript
async function showUserMenu() {
  const user = await getCurrentUserInfo();

  document.getElementById("userName").textContent = user.fullName;
  document.getElementById("userRole").textContent = user.role;

  if (user.profileImage) {
    document.getElementById("userAvatar").src = user.profileImage;
  }
}
```

### 2. Check Account Status

```javascript
async function validateUserSession() {
  const user = await getCurrentUserInfo();

  if (user.accountStatus !== "active") {
    alert(`Your account is ${user.accountStatus}`);
    redirectToLoginPage();
    return false;
  }

  return true;
}
```

### 3. Load User Dashboard

```javascript
async function loadDashboard() {
  const user = await getCurrentUserInfo();

  // Show role-specific dashboard
  if (user.role === "student") {
    loadStudentDashboard(user);
  } else if (user.role === "developer") {
    loadDeveloperDashboard(user);
  }
}
```

### 4. Update UI Based on Role

```javascript
async function initializeUI() {
  const user = await getCurrentUserInfo();

  // Show/hide elements based on role
  const adminElements = document.querySelectorAll('[data-role="admin"]');
  adminElements.forEach((el) => {
    el.style.display = user.role === "admin" ? "block" : "none";
  });
}
```

## React Integration

### Hook Component

```javascript
import { useState, useEffect } from "react";

function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user");

        const result = await response.json();
        setUser(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}

// Usage
function UserProfile() {
  const { user, loading, error } = useCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <img src={user.profileImage} alt={user.fullName} />
      <h2>{user.fullName}</h2>
      <p>Role: {user.role}</p>
      <p>Status: {user.accountStatus}</p>
    </div>
  );
}
```

### Class Component

```javascript
class UserProfile extends React.Component {
  state = {
    user: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = async () => {
    try {
      const response = await fetch("/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      this.setState({ user: result.data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  render() {
    const { user, loading, error } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
      <div className="user-profile">
        <img src={user.profileImage} alt={user.fullName} />
        <h2>{user.fullName}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

## Advanced Examples

### Error Handling & Retry Logic

```javascript
async function getCurrentUserInfoWithRetry(maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch("/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, refresh and retry
        await refreshAccessToken();
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000),
        );
      }
    }
  }

  throw lastError;
}
```

### Caching User Data

```javascript
class UserCache {
  constructor(cacheDuration = 5 * 60 * 1000) {
    // 5 minutes
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = cacheDuration;
  }

  async getUser() {
    const now = Date.now();

    // Return cached data if still valid
    if (
      this.cache &&
      this.cacheTime &&
      now - this.cacheTime < this.cacheDuration
    ) {
      return this.cache;
    }

    // Fetch fresh data
    const response = await fetch("/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");

    const result = await response.json();
    this.cache = result.data;
    this.cacheTime = now;

    return this.cache;
  }

  invalidate() {
    this.cache = null;
    this.cacheTime = null;
  }
}

// Usage
const userCache = new UserCache();
const user = await userCache.getUser();
```

### Session Validation Middleware

```javascript
function withAuthCheck(Component) {
  return function ProtectedComponent(props) {
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const validateSession = async () => {
        try {
          const response = await fetch("/user/me", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });

          if (!response.ok || response.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return;
          }

          const result = await response.json();

          if (result.data.accountStatus !== "active") {
            setIsValid(false);
            return;
          }

          setIsValid(true);
        } catch (error) {
          setIsValid(false);
        } finally {
          setIsLoading(false);
        }
      };

      validateSession();
    }, []);

    if (isLoading) return <div>Validating session...</div>;
    if (!isValid) return <div>Session invalid</div>;

    return <Component {...props} />;
  };
}
```

## Best Practices

1. **Cache User Data**: Store the `/me` response in localStorage or state to avoid repeated API calls
2. **Handle Token Expiration**: If you get a 401 response, refresh your token and retry
3. **Validate Account Status**: Always check if `accountStatus` is "active" before allowing user actions
4. **Update on Critical Actions**: Refetch user info after operations that might change it (role changes, account suspension)
5. **Graceful Fallbacks**: Display placeholder values if profile image is null
6. **Rate Limiting**: Don't call this endpoint excessively; cache for reasonable duration

## Related Endpoints

- [Personal Information](/docs/student/personal-info.md) - Detailed student information
- [User Registration](/docs/authentication/user-registration.md) - Create new account
- [User Login](/docs/authentication/user-login.md) - Authenticate user
- [User Logout](/docs/authentication/user-logout.md) - End session

## Notes

- The `/me` endpoint is available to all authenticated users regardless of role
- Profile image may be null if user hasn't uploaded one
- Account status should be checked before allowing critical operations
- This is a read-only endpoint; use other endpoints to update user information
