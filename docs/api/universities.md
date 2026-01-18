# Universities & Faculties

Public endpoints for discovering universities and fetching curated faculties for supported institutions.

---

## List Universities

- **Route:** `GET /universities`
- **Query Params:**
  - `region` (optional) – e.g., `africa`
  - `countryCode` (optional) – ISO 3166-1 alpha-2, e.g., `NG`

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Universities retrieved",
  "data": {
    "availableRegions": ["africa"],
    "availableCountries": ["NG", "DZ", "EG"],
    "count": 1485,
    "items": [
      {
        "label": "Federal University of Technology Owerri",
        "value": "federal_university_of_technology_owerri",
        "short": "FUTO",
        "code": "FUTO_NG",
        "country": "Nigeria",
        "countryCode": "NG",
        "region": "africa"
      }
    ]
  }
}
```

---

## Faculties for Institution

- **Route:** `GET /institutions/:code/faculties`
- **Path Param:** `code` – Institution code (e.g., `FUTO_NG`)

Returns curated faculties and departments for supported Nigerian institutions. Other institutions may return an empty list until curated.

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Faculties retrieved successfully",
  "data": {
    "institutionCode": "FUTO_NG",
    "count": 8,
    "faculties": [
      {
        "code": "FUTO_SICT_NG",
        "name": "School of Information and Communication Technology",
        "departments": [
          "Information Technology",
          "Computer Science",
          "Cyber Security",
          "Information Systems",
          "Software Engineering"
        ]
      }
    ]
  }
}
```

### Error Responses

- 400 Bad Request – Missing or invalid `code`
- 404 Not Found – Institution code not recognized

---

## Notes

- `code` format: `<SHORT>_<COUNTRYCODE>` (e.g., `FUTO_NG`)
- `short` is unique and supplied in the universities list
- Faculties are curated for Nigerian institutions first; more countries will be added progressively
