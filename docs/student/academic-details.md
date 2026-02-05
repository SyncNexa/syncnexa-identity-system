# Academic Details

Get the academic details of the authenticated student, including their institution, department, level, program, matriculation number, admission year, and expected graduation year.

## Endpoint

```
GET /user/academic-details
```

## Authentication

Requires a valid Bearer token. Only accessible by users with the `student` role.

## Headers

| Header        | Type   | Required | Description                     |
| ------------- | ------ | -------- | ------------------------------- |
| Authorization | string | Yes      | Bearer token for authentication |

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Academic details fetched successfully",
  "data": {
    "institution": "University of Lagos",
    "department": "Computer Science",
    "level": "400",
    "program": "undergraduate",
    "matricNumber": "CSC/2021/001",
    "admissionYear": 2021,
    "expectedGraduationYear": 2025
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized access",
  "errors": []
}
```

#### 403 Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Access forbidden",
  "errors": []
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Student record not found",
  "errors": []
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to fetch academic details",
  "errors": []
}
```

## Response Fields

| Field                  | Type   | Nullable | Description                                                                                         |
| ---------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| institution            | string | No       | Name of the institution where the student is enrolled                                               |
| department             | string | Yes      | Student's department or faculty                                                                     |
| level                  | string | Yes      | Current level/year of study (e.g., "100", "200", "300", "400", "500")                               |
| program                | string | Yes      | Type of program: `secondary`, `undergraduate`, `postgraduate`, `diploma`, `certificate`, or `other` |
| matricNumber           | string | No       | Student's unique matriculation or registration number                                               |
| admissionYear          | number | Yes      | Year the student was admitted (4-digit year)                                                        |
| expectedGraduationYear | number | Yes      | Expected year of graduation (4-digit year)                                                          |

## Program Types

The `program` field indicates the educational level:

- **secondary**: Secondary/High school education
- **undergraduate**: Bachelor's degree program
- **postgraduate**: Master's or PhD program
- **diploma**: Diploma program
- **certificate**: Certificate program
- **other**: Other types of programs

## Use Cases

1. **Profile Display**: Show complete academic information on student profiles
2. **Verification**: Provide academic details for institutional verification
3. **Analytics**: Track student distribution by program, department, and level
4. **Eligibility**: Determine eligibility for services based on academic status

## Example Requests

### JavaScript (Fetch API)

```javascript
const token = "your_access_token_here";

fetch("https://api.syncnexa.com/user/academic-details", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Academic Details:", data.data);
    console.log("Institution:", data.data.institution);
    console.log("Program:", data.data.program);
    console.log("Level:", data.data.level);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### JavaScript (Axios)

```javascript
const axios = require("axios");

const token = "your_access_token_here";

axios
  .get("https://api.syncnexa.com/user/academic-details", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    const { data } = response.data;
    console.log("Academic Details:", data);
    console.log(`${data.program} student at ${data.institution}`);
    console.log(
      `Level: ${data.level}, Expected Graduation: ${data.expectedGraduationYear}`,
    );
  })
  .catch((error) => {
    console.error("Error:", error.response?.data || error.message);
  });
```

### cURL

```bash
curl -X GET https://api.syncnexa.com/user/academic-details \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json"
```

### Python (Requests)

```python
import requests

token = 'your_access_token_here'
url = 'https://api.syncnexa.com/user/academic-details'

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(url, headers=headers)
data = response.json()

if response.status_code == 200:
    academic_data = data['data']
    print(f"Academic Details: {academic_data}")
    print(f"Institution: {academic_data['institution']}")
    print(f"Department: {academic_data['department']}")
    print(f"Program: {academic_data['program']}")
    print(f"Level: {academic_data['level']}")
    print(f"Matric Number: {academic_data['matricNumber']}")
    print(f"Admission Year: {academic_data['admissionYear']}")
    print(f"Expected Graduation: {academic_data['expectedGraduationYear']}")
else:
    print(f"Error: {data['message']}")
```

### Node.js (Native HTTPS)

```javascript
const https = require("https");

const token = "your_access_token_here";

const options = {
  hostname: "api.syncnexa.com",
  path: "/user/academic-details",
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const response = JSON.parse(data);
    if (res.statusCode === 200) {
      console.log("Academic Details:", response.data);
      console.log(`Student at ${response.data.institution}`);
      console.log(`${response.data.program} - Level ${response.data.level}`);
    } else {
      console.error("Error:", response.message);
    }
  });
});

req.on("error", (error) => {
  console.error("Request Error:", error);
});

req.end();
```

## Data Validation

- **institution**: Must not be empty
- **matricNumber**: Must be unique and not empty
- **level**: Common values include "100", "200", "300", "400", "500" for undergraduate programs
- **program**: Must be one of the defined enum values
- **admissionYear**: Must be a valid 4-digit year
- **expectedGraduationYear**: Must be a valid 4-digit year, typically 3-6 years after admission year

## Notes

- The `department` field may be null for secondary school students
- The `level` field may be null for certain program types
- The `program` field helps distinguish between undergraduate and postgraduate students
- The `expectedGraduationYear` is an estimate and may change due to various factors
- This endpoint only returns data for authenticated students
- Staff and developers cannot access their academic details through this endpoint (as they are not students)

## Related Endpoints

- [Current User Info](me.md) - Get minimal current user information
- [Personal Information](personal-info.md) - Get detailed personal information
- [Academic Records](academic-records.md) - Manage detailed academic records and transcripts
- [Verification Requests](verification-requests.md) - Request institutional verification

## Security Considerations

- Academic details should be treated as sensitive information
- Only the authenticated student can access their own academic details
- Ensure proper token validation and authorization checks
- Academic data should be verified through institutional verification when used for critical decisions

## Best Practices

1. **Cache Wisely**: Academic details change infrequently, consider caching with appropriate TTL
2. **Error Handling**: Always handle potential 404 errors (student record may not exist yet)
3. **Data Display**: Format program and level values appropriately for user display
4. **Verification**: For critical operations, combine with institutional verification status
5. **Privacy**: Don't expose matriculation numbers or other identifying information publicly

## Troubleshooting

### Student Record Not Found (404)

This typically means:

- The authenticated user is not registered as a student
- The student record hasn't been created yet (new user)
- Data migration or sync issues

**Solution**: Ensure the user has completed student registration and their record exists in the database.

### Forbidden Access (403)

This means:

- The authenticated user doesn't have the `student` role
- The user might be a `staff`, `developer`, or `visitor`

**Solution**: This endpoint is exclusively for students. Use the appropriate endpoint for other user types.

## Changelog

### Version 1.1.0 (February 2026)

- Added `program` field to distinguish education level
- Added `expectedGraduationYear` field
- Renamed internal `degree` field to `degree_name` (API unchanged)

### Version 1.0.0 (January 2026)

- Initial release
- Basic academic details endpoint with institution, department, level, and matric number
