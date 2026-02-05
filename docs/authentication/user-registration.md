# User Registration

Complete documentation for creating new user accounts on the SyncNexa Identity platform.

---

## Overview

The registration endpoint allows new users to create accounts with role-based profile setup. SyncNexa supports multiple user types (Student, Staff, Developer, Visitor), each with specific validation requirements and onboarding paths.

**Use Cases:**

- Sign up as a student with institution details
- Register as staff or developer
- Create anonymous visitor accounts
- Bulk import institutional students
- Self-service account creation

**Authentication:** Not required - this endpoint is public

---

## Create Account

**Name:** User Registration

**Description:** Registers a new user account on the SyncNexa platform. The system validates all input, hashes the password securely using bcrypt, creates the user account, and initializes profile progress tracking. Student registrations include institution verification. Upon success, the user receives their account details (excluding password hash).

**Route:** `POST /auth/register`

**Authentication Required:** No

### Request Payload - Basic Registration

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecureP@ss123",
  "role": "staff",
  "country": "Nigeria",
  "state": "Lagos",
  "address": "123 Main Street, Ikeja",
  "gender": "male",
  "phone": "+2348012345678"
}
```

### Request Payload - Student Registration

```json
{
  "firstName": "Ada",
  "lastName": "Obi",
  "email": "ada.obi@example.com",
  "password": "SecureP@ss123",
  "role": "student",
  "country": "Nigeria",
  "state": "Imo",
  "address": "FUTO Campus Road",
  "gender": "female",
  "phone": "+2348012345678",
  "academic_info": {
    "institution": "FUTO_NG",
    "matric_number": "20201230342",
    "degree": "B.Tech",
    "department": "Information Technology",
    "faculty": "SICT",
    "admission_year": 2021,
    "student_level": "300",
    "graduation_year": 2025
  }
}
```

### Field Requirements

| Field     | Type   | Required | Validation                                                           |
| --------- | ------ | -------- | -------------------------------------------------------------------- |
| firstName | string | Yes      | Minimum 2 characters, letters and spaces only                        |
| lastName  | string | Yes      | Minimum 2 characters, letters and spaces only                        |
| email     | string | Yes      | Valid email format (RFC 5322)                                        |
| password  | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character |
| role      | string | Yes      | Enum: `student`, `staff`, `developer`, `visitor`                     |
| country   | string | Yes      | 2-56 characters, letters and spaces only                             |
| state     | string | Yes      | 2-50 characters, letters, spaces, or hyphens                         |
| address   | string | Yes      | 5-100 characters, alphanumeric and `.,#-/` allowed                   |
| gender    | string | Yes      | Enum: `male`, `female`, `non-binary`, `other`                        |
| phone     | string | Yes      | E.164 format (e.g., +2348012345678), 8-15 digits                     |

### Student-Specific Fields (inside `academic_info`)

| Field           | Type   | Required | Validation                                           |
| --------------- | ------ | -------- | ---------------------------------------------------- |
| institution     | string | Yes      | Valid institution code (e.g., FUTO_NG, IMSU_NG)      |
| matric_number   | string | Yes      | Minimum 2 characters, unique per institution         |
| degree          | string | Yes      | Valid degree type (B.Tech, B.Sc, B.Eng, MBA, etc.)   |
| department      | string | No       | Minimum 2 characters                                 |
| faculty         | string | No       | Valid faculty code for the institution               |
| admission_year  | number | Yes      | Integer between 1900 and current year                |
| student_level   | string | No       | Student's current level (100, 200, 300, 400, etc.)   |
| graduation_year | number | Yes      | Integer between admission_year and current year + 10 |

### Password Requirements

**Security Rules:**

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&\*)

**Examples of Valid Passwords:**

- `SecureP@ss123`
- `MyPass!2024`
- `Welcome#99`

**Examples of Invalid Passwords:**

- `password` - no uppercase, no number, no special char
- `Password` - no number, no special char
- `Pass123` - no special char
- `Pass@1` - only 6 characters

### Request Example (JavaScript)

```javascript
async function registerUser(registrationData) {
  try {
    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Registration failed:", result.message);
      if (result.errors) {
        result.errors.forEach((err) => {
          console.error(`${err.field}: ${err.message}`);
        });
      }
      return null;
    }

    console.log("Registration successful:", result.data);
    return result.data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}

// Usage - Staff Registration
const staffUser = await registerUser({
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@university.edu.ng",
  password: "UniStaff@2024",
  role: "staff",
  country: "Nigeria",
  state: "Lagos",
  address: "45 University Avenue, Lagos",
  gender: "male",
  phone: "+2348012345678",
});

// Usage - Student Registration
const studentUser = await registerUser({
  firstName: "Ada",
  lastName: "Obi",
  email: "ada.obi@student.futo.edu.ng",
  password: "StudentP@ss123",
  role: "student",
  country: "Nigeria",
  state: "Imo",
  address: "FUTO Campus",
  gender: "female",
  phone: "+2348019876543",
  academic_info: {
    institution: "FUTO_NG",
    matric_number: "20201230342",
    degree: "B.Tech",
    department: "Information Technology",
    faculty: "SICT",
    admission_year: 2021,
    student_level: "300",
    graduation_year: 2025,
  },
});
```

### Request Example (cURL)

```bash
# Staff Registration
curl -X POST https://identity.syncnexa.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@university.edu.ng",
    "password": "UniStaff@2024",
    "role": "staff",
    "country": "Nigeria",
    "state": "Lagos",
    "address": "45 University Avenue, Lagos",
    "gender": "male",
    "phone": "+2348012345678"
  }'

# Student Registration
curl -X POST https://identity.syncnexa.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ada",
    "lastName": "Obi",
    "email": "ada.obi@student.futo.edu.ng",
    "password": "StudentP@ss123",
    "role": "student",
    "country": "Nigeria",
    "state": "Imo",
    "address": "FUTO Campus",
    "gender": "female",
    "phone": "+2348019876543",
    "academic_info": {
      "institution": "FUTO_NG",
      "matric_number": "20201230342",
      "degree": "B.Tech",
      "department": "Information Technology",
      "faculty": "SICT",
      "admission_year": 2021,
      "student_level": "300",
      "graduation_year": 2025
    }
  }'
```

### Request Example (Python)

```python
import requests
import json

class RegistrationService:
    def __init__(self):
        self.base_url = 'https://identity.syncnexa.com/api/v1'
        self.headers = {'Content-Type': 'application/json'}

    def register_staff(self, first_name, last_name, email, password,
                       phone, country, state, address, gender):
        """Register a new staff member"""
        payload = {
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'password': password,
            'role': 'staff',
            'country': country,
            'state': state,
            'address': address,
            'gender': gender,
            'phone': phone
        }

        response = requests.post(
            f'{self.base_url}/auth/register',
            headers=self.headers,
            json=payload
        )

        return response.json()

    def register_student(self, first_name, last_name, email, password,
                        phone, country, state, address, gender,
                        institution, matric_number, degree, admission_year,
                        graduation_year, faculty=None, department=None, level=None):
        """Register a new student"""
        payload = {
            'firstName': first_name,
            'lastName': last_name,
            'email': email,
            'password': password,
            'role': 'student',
            'country': country,
            'state': state,
            'address': address,
            'gender': gender,
            'phone': phone,
            'academic_info': {
                'institution': institution,
                'matric_number': matric_number,
                'degree': degree,
                'admission_year': admission_year,
                'graduation_year': graduation_year
            }
        }

        if faculty:
            payload['academic_info']['faculty'] = faculty
        if department:
            payload['academic_info']['department'] = department
        if level:
            payload['academic_info']['student_level'] = level

        response = requests.post(
            f'{self.base_url}/auth/register',
            headers=self.headers,
            json=payload
        )

        return response.json()

    def batch_register_students(self, students_data):
        """Register multiple students from CSV/list"""
        results = []

        for student in students_data:
            result = self.register_student(
                first_name=student['first_name'],
                last_name=student['last_name'],
                email=student['email'],
                password=student['password'],
                phone=student['phone'],
                country=student['country'],
                state=student['state'],
                address=student['address'],
                gender=student['gender'],
                institution=student['institution'],
                matric_number=student['matric_number'],
                degree=student['degree'],
                admission_year=student['admission_year'],
                graduation_year=student['graduation_year'],
                faculty=student.get('faculty'),
                department=student.get('department'),
                level=student.get('student_level')
            )

            results.append({
                'email': student['email'],
                'status': 'success' if result.get('status') == 'success' else 'failed',
                'message': result.get('message'),
                'user_id': result.get('data', {}).get('id') if result.get('status') == 'success' else None
            })

        return results

# Usage
service = RegistrationService()

# Register staff
staff_result = service.register_staff(
    first_name='John',
    last_name='Smith',
    email='john.smith@university.edu.ng',
    password='UniStaff@2024',
    phone='+2348012345678',
    country='Nigeria',
    state='Lagos',
    address='45 University Avenue, Lagos',
    gender='male'
)

print(staff_result)

# Register student
student_result = service.register_student(
    first_name='Ada',
    last_name='Obi',
    email='ada.obi@student.futo.edu.ng',
    password='StudentP@ss123',
    phone='+2348019876543',
    country='Nigeria',
    state='Imo',
    address='FUTO Campus',
    gender='female',
    institution='FUTO_NG',
    matric_number='20201230342',
    degree='B.Tech',
    admission_year=2021,
    graduation_year=2025,
    faculty='SICT',
    department='Information Technology',
    level='300'
)

print(student_result)
```

### Success Response (201 Created)

#### Non-Student Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User created successfully!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.smith@university.edu.ng",
    "first_name": "John",
    "last_name": "Smith",
    "user_country": "Nigeria",
    "user_state": "Lagos",
    "user_address": "45 University Avenue, Lagos",
    "gender": "male",
    "phone": "+2348012345678",
    "user_role": "staff",
    "is_verified": false,
    "account_status": "active",
    "created_at": "2026-02-05T10:30:00.000Z"
  }
}
```

#### Student Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User created successfully!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "ada.obi@student.futo.edu.ng",
    "first_name": "Ada",
    "last_name": "Obi",
    "user_country": "Nigeria",
    "user_state": "Imo",
    "user_address": "FUTO Campus",
    "gender": "female",
    "phone": "+2348019876543",
    "user_role": "student",
    "is_verified": false,
    "account_status": "active",
    "institution": "Federal University of Technology, Owerri",
    "institution_code": "FUTO_NG",
    "faculty": "School of Information and Communication Technology",
    "faculty_code": "SICT",
    "matric_number": "20201230342",
    "created_at": "2026-02-05T10:30:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Failures

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must contain at least one special character"
    }
  ]
}
```

**What Happens:** The request is rejected at the validation layer before reaching the database. No user account is created. All validation errors are returned in the response so the client can fix them all at once.

#### Common Validation Errors

| Scenario                   | Error Message                                                                                                                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name too short**         | "First name must be at least 2 characters long"                                                                                                                                                                                                                      |
| **Invalid email**          | "Invalid email address"                                                                                                                                                                                                                                              |
| **Weak password**          | "Password must be at least 8 characters long" / "Password must contain at least one uppercase letter" / "Password must contain at least one lowercase letter" / "Password must contain at least one number" / "Password must contain at least one special character" |
| **Invalid role**           | 'Invalid role. Supported roles are: "student", "staff", "developer", or "visitor"'                                                                                                                                                                                   |
| **Invalid country**        | "Country must contain only letters and spaces"                                                                                                                                                                                                                       |
| **Invalid state**          | "State must contain only letters, spaces, or hyphens"                                                                                                                                                                                                                |
| **Invalid address**        | "Address contains invalid characters"                                                                                                                                                                                                                                |
| **Invalid phone**          | "Invalid phone number format (use E.164, e.g. +2348012345678)"                                                                                                                                                                                                       |
| **Invalid gender**         | "Invalid enum value. Expected 'male' \| 'female' \| 'non-binary' \| 'other'"                                                                                                                                                                                         |
| **Missing student fields** | "Institution, matric_number, degree are required in academic_info for student registration"                                                                                                                                                                          |
| **Invalid institution**    | "Invalid institution code. Valid codes: FUTO_NG, IMSU_NG, ..."                                                                                                                                                                                                       |
| **Invalid faculty**        | "Faculty code is not valid for the selected institution"                                                                                                                                                                                                             |

### 409 Conflict - Email Already Exists

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "Email address is already registered. Please use a different email or login instead."
}
```

**What Happens:** The email is already registered in the system. No duplicate account is created. The existing account remains unchanged. User should either use a different email address or log in with the existing account.

### 409 Conflict - Matric Number Already Exists (Students Only)

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "This matric number is already registered. Each student can only have one account."
}
```

**What Happens:** The matric number is already registered in the system. This prevents students from creating multiple accounts with the same matric number (one account per student). User should contact support if they believe this is an error.

### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Could not create account, please try again."
}
```

**What Happens:** An unexpected error occurred during account creation (database connection issue, server error, etc.). No user account is created. User should retry after a brief delay or contact support if the issue persists.

---

## Edge Cases

| Scenario                            | Behavior                                             |
| ----------------------------------- | ---------------------------------------------------- |
| **Email with special formatting**   | Standardized to lowercase before checking uniqueness |
| **Multiple validation errors**      | All errors returned at once, not one at a time       |
| **Duplicate registration attempts** | Same email → 409; Same matric (student) → 409        |
| **Very long strings**               | Truncated to max field length or rejected            |
| **Case sensitivity**                | Email: case-insensitive; Password: case-sensitive    |
| **Whitespace in fields**            | Trimmed from beginning/end of strings                |
| **HTML/Script in fields**           | Escaped or rejected depending on field               |

---

## Examples

### Complete Student Registration Flow

```javascript
// 1. Validate input on client
function validateRegistration(data) {
  const errors = [];

  if (!data.email.includes("@")) {
    errors.push("Invalid email");
  }
  if (data.password.length < 8) {
    errors.push("Password too short");
  }
  if (data.role === "student" && !data.academic_info) {
    errors.push("Academic info required for students");
  }

  return errors.length === 0;
}

// 2. Show form with password requirements
const registrationForm = `
  <form id="registration">
    <input type="text" name="firstName" placeholder="First Name" required />
    <input type="text" name="lastName" placeholder="Last Name" required />
    <input type="email" name="email" placeholder="Email" required />
    
    <input type="password" name="password" placeholder="Password" 
           pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}" 
           title="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char" 
           required />
    
    <!-- Show requirements -->
    <div class="password-requirements">
      <small>✓ At least 8 characters</small>
      <small>✓ At least 1 uppercase letter</small>
      <small>✓ At least 1 lowercase letter</small>
      <small>✓ At least 1 number</small>
      <small>✓ At least 1 special character</small>
    </div>
    
    <button type="submit">Register</button>
  </form>
`;

// 3. Handle registration
document
  .getElementById("registration")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (!validateRegistration(data)) {
      alert("Please fix validation errors");
      return;
    }

    const response = await fetch(
      "https://identity.syncnexa.com/api/v1/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();

    if (result.status === "success") {
      console.log("Registration successful!", result.data.id);
      alert("Account created! Please verify your email.");
      window.location.href = "/verify-email";
    } else {
      console.error("Registration failed:", result.errors);
      alert("Registration failed: " + result.message);
    }
  });
```

### Python Batch Registration

```python
import csv
from datetime import datetime

class BulkRegistration:
    def __init__(self, base_url, headers):
        self.base_url = base_url
        self.headers = headers

    def register_from_csv(self, csv_file):
        """Register students from CSV file"""
        results = []

        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                try:
                    # Generate email from names if not provided
                    email = row.get('email') or f"{row['first_name']}.{row['last_name']}@student.edu.ng".lower()

                    payload = {
                        'firstName': row['first_name'],
                        'lastName': row['last_name'],
                        'email': email,
                        'password': f"TempPass@{row['matric_number'][-4:]}",
                        'role': 'student',
                        'country': 'Nigeria',
                        'state': row['state'],
                        'address': 'Campus Address',
                        'gender': row['gender'],
                        'phone': row['phone'],
                        'academic_info': {
                            'institution': row['institution'],
                            'matric_number': row['matric_number'],
                            'degree': row['degree'],
                            'admission_year': int(row['admission_year']),
                            'graduation_year': int(row['graduation_year'])
                        }
                    }

                    response = requests.post(
                        f'{self.base_url}/auth/register',
                        headers=self.headers,
                        json=payload
                    )

                    data = response.json()

                    results.append({
                        'email': email,
                        'matric': row['matric_number'],
                        'status': 'success' if response.status_code == 201 else 'failed',
                        'message': data.get('message'),
                        'user_id': data.get('data', {}).get('id'),
                        'error': data.get('errors') if response.status_code != 201 else None
                    })

                except Exception as e:
                    results.append({
                        'email': row.get('email', 'unknown'),
                        'status': 'error',
                        'message': str(e)
                    })

        return results

    def generate_report(self, results):
        """Generate registration report"""
        total = len(results)
        successful = sum(1 for r in results if r['status'] == 'success')
        failed = sum(1 for r in results if r['status'] in ['failed', 'error'])

        print(f"\nRegistration Report")
        print(f"{'=' * 50}")
        print(f"Total: {total}")
        print(f"Successful: {successful} ({successful/total*100:.1f}%)")
        print(f"Failed: {failed} ({failed/total*100:.1f}%)")

        if failed > 0:
            print(f"\n{'Failed Registrations:'}")
            for r in results:
                if r['status'] != 'success':
                    print(f"  - {r['email']}: {r['message']}")

# Usage
bulk_reg = BulkRegistration(
    'https://identity.syncnexa.com/api/v1',
    {'Content-Type': 'application/json'}
)

results = bulk_reg.register_from_csv('students.csv')
bulk_reg.generate_report(results)
```

---

## Best Practices

### Registration Form Design

- Show password requirements before user starts typing
- Use client-side validation for immediate feedback
- Don't pre-fill password fields
- Require password confirmation
- Show password strength indicator

### Security

- Always use HTTPS for registration
- Implement rate limiting (max 5 attempts per IP per hour)
- Hash passwords server-side (never send plaintext)
- Validate all inputs server-side (don't trust client validation)
- Log registration attempts for audit

### User Experience

- Show clear error messages for each field
- Allow inline validation
- Pre-format phone numbers
- Use email as username (not separate username field)
- Send confirmation email after registration

### Student Registration

- Verify institution and matric number format
- Match graduation year to admission year
- Allow bulk import via CSV for institutions
- Provide institution selection dropdown
- Auto-populate institution details in response

---

## Related Features

- **[User Login](/docs/authentication/user-login)** - Authenticate with credentials
- **[Email Verification](/docs/authentication/email-verification)** - Verify email address
- **[User Profile](/docs/student/documents)** - Complete profile after registration
