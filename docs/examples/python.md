# Examples — Python (SAuth 1.0)

Complete example of integrating SAuth 1.0 in a Python Flask application.

## Setup

```bash
pip install flask requests python-dotenv
```

## Environment Variables

```env
SAUTH_APP_ID=your_app_id
SAUTH_CLIENT_ID=your_client_id
SAUTH_CLIENT_SECRET=your_client_secret
SAUTH_REDIRECT_URI=http://localhost:5000/auth/callback
SAUTH_BASE_URL=http://localhost:3000/api/v1
FLASK_SECRET_KEY=random_secret_key
```

## Implementation

```python
from flask import Flask, redirect, request, session, render_template
import requests
import os
import secrets
from functools import wraps

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

SAUTH_BASE_URL = os.getenv('SAUTH_BASE_URL')
SAUTH_APP_ID = os.getenv('SAUTH_APP_ID')
SAUTH_CLIENT_ID = os.getenv('SAUTH_CLIENT_ID')
SAUTH_CLIENT_SECRET = os.getenv('SAUTH_CLIENT_SECRET')
SAUTH_REDIRECT_URI = os.getenv('SAUTH_REDIRECT_URI')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'access_token' not in session:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login')
def login():
    """Redirect user to SyncNexa SAuth authorization"""
    state = secrets.token_urlsafe(16)
    session['oauth_state'] = state

    params = {
        'app_id': SAUTH_APP_ID,
        'client_id': SAUTH_CLIENT_ID,
        'redirect_uri': SAUTH_REDIRECT_URI,
        'scopes': 'profile student:profile',
        'state': state,
    }

    auth_url = f"{SAUTH_BASE_URL}/sauth/authorize"
    query_string = '&'.join(f"{k}={v}" for k, v in params.items())
    return redirect(f"{auth_url}?{query_string}")

@app.route('/auth/callback')
def auth_callback():
    """Handle SAuth callback"""
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')

    if error:
        return f"Authorization denied: {error}"

    # Verify state
    if state != session.get('oauth_state'):
        return "State mismatch", 400

    try:
        # Exchange code for token
        token_response = requests.post(
            f"{SAUTH_BASE_URL}/sauth/token",
            json={
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': SAUTH_CLIENT_ID,
                'client_secret': SAUTH_CLIENT_SECRET,
                'app_id': SAUTH_APP_ID,
            }
        )
        token_response.raise_for_status()
        data = token_response.json()

        session['access_token'] = data['access_token']
        session['expires_in'] = data['expires_in']

        return redirect('/dashboard')
    except requests.RequestException as e:
        return f"Token exchange failed: {e}", 500

@app.route('/dashboard')
@login_required
def dashboard():
    """Fetch and display user profile"""
    try:
        user_response = requests.get(
            f"{SAUTH_BASE_URL}/user/profile",
            headers={'Authorization': f"Bearer {session['access_token']}"}
        )
        user_response.raise_for_status()
        user = user_response.json()

        return render_template('dashboard.html', user=user)
    except requests.RequestException as e:
        return redirect('/login')

@app.route('/logout')
def logout():
    """Clear session"""
    session.clear()
    return redirect('/')

@app.route('/')
def index():
    return '<a href="/login">Login with SyncNexa</a>'

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Dashboard Template

```html
<!-- templates/dashboard.html -->
<h1>Welcome, {{ user.displayName }}!</h1>
<p>Email: {{ user.email }}</p>
<p>Role: {{ user.role }}</p>
<a href="/logout">Logout</a>
```

## Testing

1. Start your Flask app: `python app.py`
2. Visit `http://localhost:5000/`
3. Click "Login with SyncNexa"
4. Approve authorization
5. View your dashboard

## Next Steps

→ [Node.js Example](./nodejs) — JavaScript backend  
→ [Quick Start](../getting-started/quick-start) — Overview
