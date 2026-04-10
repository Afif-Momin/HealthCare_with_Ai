# Medical AI Backend

A comprehensive Spring Boot backend application for Medical AI services without authentication.

## Features

- **Patient Management**: CRUD operations for patient records
- **Medical Records**: Store and manage medical records, diagnoses, and treatments
- **Appointment Scheduling**: Manage patient appointments
- **Prescription Management**: Track patient prescriptions
- **AI Analysis**: Integration points for AI-powered medical analysis
- **RESTful API**: Complete REST API with proper error handling

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **Spring WebFlux** (for HTTP client)
- **Google Gemini AI API** (for medical analysis)
- **H2 Database** (for development)
- **MySQL** (for production)
- **Lombok** (for reducing boilerplate code)
- **Maven** (for dependency management)

## Project Structure

```
src/
├── main/
│   ├── java/com/medicalai/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Exception handling
│   │   ├── repository/      # Data access layer
│   │   └── service/         # Business logic layer
│   └── resources/
│       └── application.properties
└── pom.xml
```

## Complete API Documentation

### Base URL
All API endpoints are prefixed with: `http://localhost:8080/api`

---

## 1. Patient Management APIs

### 1.1 Create Patient
**Endpoint:** `POST /api/patients`

**Description:** Creates a new patient record in the system. Validates required fields and stores patient information including personal details, contact information, medical history, and emergency contacts.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (optional, must be valid email format)",
  "phoneNumber": "string (optional)",
  "dateOfBirth": "string (required, format: YYYY-MM-DD)",
  "gender": "enum (optional: MALE, FEMALE, OTHER)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "zipCode": "string (optional)",
  "country": "string (optional)",
  "bloodGroup": "string (optional)",
  "allergies": "string (optional)",
  "medicalHistory": "string (optional)",
  "emergencyContactName": "string (optional)",
  "emergencyContactPhone": "string (optional)"
}
```

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "bloodGroup": "O+",
  "allergies": "Peanuts, Shellfish",
  "medicalHistory": "Hypertension, Diabetes Type 2",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "0987654321",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "bloodGroup": "O+",
    "allergies": "Peanuts",
    "medicalHistory": "Hypertension"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors (missing required fields, invalid email format)
- `500 Internal Server Error` - Server error

---

### 1.2 Get All Patients
**Endpoint:** `GET /api/patients`

**Description:** Retrieves a list of all patients in the system. Supports optional search functionality to filter patients by first name or last name.

**Query Parameters:**
- `search` (optional, string) - Search term to filter patients by first name or last name (case-insensitive)

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "bloodGroup": "O+",
    "allergies": "Peanuts",
    "medicalHistory": "Hypertension",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "0987654321",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Example Requests:**
```bash
# Get all patients
curl -X GET http://localhost:8080/api/patients

# Search patients by name
curl -X GET "http://localhost:8080/api/patients?search=John"
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### 1.3 Get Patient by ID
**Endpoint:** `GET /api/patients/{id}`

**Description:** Retrieves detailed information about a specific patient by their unique identifier.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the patient

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "bloodGroup": "O+",
  "allergies": "Peanuts",
  "medicalHistory": "Hypertension",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "0987654321",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/patients/1
```

**Error Responses:**
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 1.4 Update Patient
**Endpoint:** `PUT /api/patients/{id}`

**Description:** Updates an existing patient's information. All fields in the request body will be updated. Fields not included in the request will remain unchanged.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the patient to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (optional, must be valid email format)",
  "phoneNumber": "string (optional)",
  "dateOfBirth": "string (required, format: YYYY-MM-DD)",
  "gender": "enum (optional: MALE, FEMALE, OTHER)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "zipCode": "string (optional)",
  "country": "string (optional)",
  "bloodGroup": "string (optional)",
  "allergies": "string (optional)",
  "medicalHistory": "string (optional)",
  "emergencyContactName": "string (optional)",
  "emergencyContactPhone": "string (optional)"
}
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "bloodGroup": "O+",
  "allergies": "Peanuts, Shellfish",
  "medicalHistory": "Hypertension, Diabetes Type 2",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "0987654321",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/patients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "allergies": "Peanuts, Shellfish"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 1.5 Delete Patient
**Endpoint:** `DELETE /api/patients/{id}`

**Description:** Permanently deletes a patient record from the system. This action cannot be undone.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the patient to delete

**Request Headers:**
```
None required
```

**Response Status:** `204 No Content`

**Response Body:**
```
No content
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/patients/1
```

**Error Responses:**
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

## 2. Medical Records APIs

### 2.1 Create Medical Record
**Endpoint:** `POST /api/medical-records`

**Description:** Creates a new medical record for a patient. Medical records can include diagnoses, lab reports, X-rays, prescriptions, and other medical documentation.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "recordType": "string (required, e.g., 'Diagnosis', 'Lab Report', 'X-Ray', 'Prescription')",
  "title": "string (required)",
  "description": "string (optional)",
  "diagnosis": "string (optional)",
  "symptoms": "string (optional)",
  "treatment": "string (optional)",
  "notes": "string (optional)",
  "doctorName": "string (optional)",
  "hospitalName": "string (optional)",
  "fileUrl": "string (optional, URL or path to medical file)",
  "recordDate": "string (optional, format: YYYY-MM-DDTHH:mm:ss, defaults to current time)"
}
```

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "recordType": "Diagnosis",
  "title": "Annual Checkup",
  "description": "Routine annual health checkup",
  "diagnosis": "Healthy, no issues found",
  "symptoms": "None",
  "treatment": "Continue current lifestyle",
  "notes": "Patient is in good health",
  "doctorName": "Dr. Smith",
  "hospitalName": "City Hospital",
  "fileUrl": null,
  "recordDate": "2024-01-15T10:30:00",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "recordType": "Diagnosis",
    "title": "Annual Checkup",
    "description": "Routine annual health checkup",
    "diagnosis": "Healthy, no issues found",
    "doctorName": "Dr. Smith",
    "hospitalName": "City Hospital"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors (missing required fields)
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 2.2 Get All Medical Records
**Endpoint:** `GET /api/medical-records`

**Description:** Retrieves a list of all medical records. Supports filtering by patient ID and/or record type.

**Query Parameters:**
- `patientId` (optional, Long) - Filter records by patient ID
- `recordType` (optional, string) - Filter records by type (e.g., "Diagnosis", "Lab Report")
- Note: If both `patientId` and `recordType` are provided, records matching both criteria are returned

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "recordType": "Diagnosis",
    "title": "Annual Checkup",
    "description": "Routine annual health checkup",
    "diagnosis": "Healthy, no issues found",
    "symptoms": "None",
    "treatment": "Continue current lifestyle",
    "notes": "Patient is in good health",
    "doctorName": "Dr. Smith",
    "hospitalName": "City Hospital",
    "fileUrl": null,
    "recordDate": "2024-01-15T10:30:00",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Example Requests:**
```bash
# Get all medical records
curl -X GET http://localhost:8080/api/medical-records

# Get records for a specific patient
curl -X GET "http://localhost:8080/api/medical-records?patientId=1"

# Get records by type
curl -X GET "http://localhost:8080/api/medical-records?recordType=Diagnosis"

# Get records for patient by type
curl -X GET "http://localhost:8080/api/medical-records?patientId=1&recordType=Diagnosis"
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### 2.3 Get Medical Record by ID
**Endpoint:** `GET /api/medical-records/{id}`

**Description:** Retrieves detailed information about a specific medical record by its unique identifier.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the medical record

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "recordType": "Diagnosis",
  "title": "Annual Checkup",
  "description": "Routine annual health checkup",
  "diagnosis": "Healthy, no issues found",
  "symptoms": "None",
  "treatment": "Continue current lifestyle",
  "notes": "Patient is in good health",
  "doctorName": "Dr. Smith",
  "hospitalName": "City Hospital",
  "fileUrl": null,
  "recordDate": "2024-01-15T10:30:00",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/medical-records/1
```

**Error Responses:**
- `404 Not Found` - Medical record with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 2.4 Update Medical Record
**Endpoint:** `PUT /api/medical-records/{id}`

**Description:** Updates an existing medical record. All fields in the request body will be updated.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the medical record to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "recordType": "string (required)",
  "title": "string (required)",
  "description": "string (optional)",
  "diagnosis": "string (optional)",
  "symptoms": "string (optional)",
  "treatment": "string (optional)",
  "notes": "string (optional)",
  "doctorName": "string (optional)",
  "hospitalName": "string (optional)",
  "fileUrl": "string (optional)",
  "recordDate": "string (optional, format: YYYY-MM-DDTHH:mm:ss)"
}
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "recordType": "Diagnosis",
  "title": "Updated Checkup",
  "description": "Updated description",
  "diagnosis": "Updated diagnosis",
  "symptoms": "None",
  "treatment": "Updated treatment",
  "notes": "Updated notes",
  "doctorName": "Dr. Smith",
  "hospitalName": "City Hospital",
  "fileUrl": null,
  "recordDate": "2024-01-15T10:30:00",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/medical-records/1 \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "Diagnosis",
    "title": "Updated Checkup",
    "diagnosis": "Updated diagnosis",
    "notes": "Updated notes"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - Medical record with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 2.5 Delete Medical Record
**Endpoint:** `DELETE /api/medical-records/{id}`

**Description:** Permanently deletes a medical record from the system.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the medical record to delete

**Request Headers:**
```
None required
```

**Response Status:** `204 No Content`

**Response Body:**
```
No content
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/medical-records/1
```

**Error Responses:**
- `404 Not Found` - Medical record with the given ID does not exist
- `500 Internal Server Error` - Server error

---

## 3. Appointment Management APIs

### 3.1 Create Appointment
**Endpoint:** `POST /api/appointments`

**Description:** Creates a new appointment for a patient. Appointments can be scheduled with doctors in various departments.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "doctorName": "string (required)",
  "department": "string (required)",
  "appointmentDate": "string (required, format: YYYY-MM-DDTHH:mm:ss)",
  "status": "enum (optional, default: SCHEDULED, values: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)",
  "reason": "string (optional)",
  "notes": "string (optional)",
  "location": "string (optional)"
}
```

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "department": "Cardiology",
  "appointmentDate": "2024-01-20T14:30:00",
  "status": "SCHEDULED",
  "reason": "Routine checkup",
  "notes": "Patient requested morning appointment",
  "location": "Room 101, Building A",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorName": "Dr. Smith",
    "department": "Cardiology",
    "appointmentDate": "2024-01-20T14:30:00",
    "status": "SCHEDULED",
    "reason": "Routine checkup",
    "location": "Room 101"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors (missing required fields)
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 3.2 Get All Appointments
**Endpoint:** `GET /api/appointments`

**Description:** Retrieves a list of all appointments. Supports filtering by patient ID or appointment status.

**Query Parameters:**
- `patientId` (optional, Long) - Filter appointments by patient ID
- `status` (optional, string) - Filter appointments by status (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- Note: If `patientId` is provided, it takes precedence over `status`

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "department": "Cardiology",
    "appointmentDate": "2024-01-20T14:30:00",
    "status": "SCHEDULED",
    "reason": "Routine checkup",
    "notes": "Patient requested morning appointment",
    "location": "Room 101, Building A",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Example Requests:**
```bash
# Get all appointments
curl -X GET http://localhost:8080/api/appointments

# Get appointments for a specific patient
curl -X GET "http://localhost:8080/api/appointments?patientId=1"

# Get appointments by status
curl -X GET "http://localhost:8080/api/appointments?status=SCHEDULED"
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### 3.3 Get Appointment by ID
**Endpoint:** `GET /api/appointments/{id}`

**Description:** Retrieves detailed information about a specific appointment by its unique identifier.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the appointment

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "department": "Cardiology",
  "appointmentDate": "2024-01-20T14:30:00",
  "status": "SCHEDULED",
  "reason": "Routine checkup",
  "notes": "Patient requested morning appointment",
  "location": "Room 101, Building A",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/appointments/1
```

**Error Responses:**
- `404 Not Found` - Appointment with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 3.4 Update Appointment
**Endpoint:** `PUT /api/appointments/{id}`

**Description:** Updates an existing appointment. Can be used to change appointment details, status, or notes.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the appointment to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "doctorName": "string (required)",
  "department": "string (required)",
  "appointmentDate": "string (required, format: YYYY-MM-DDTHH:mm:ss)",
  "status": "enum (required, values: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)",
  "reason": "string (optional)",
  "notes": "string (optional)",
  "location": "string (optional)"
}
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorName": "Dr. Smith",
  "department": "Cardiology",
  "appointmentDate": "2024-01-20T15:00:00",
  "status": "CONFIRMED",
  "reason": "Routine checkup",
  "notes": "Updated: Patient confirmed attendance",
  "location": "Room 101, Building A",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/appointments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "doctorName": "Dr. Smith",
    "department": "Cardiology",
    "appointmentDate": "2024-01-20T15:00:00",
    "status": "CONFIRMED",
    "notes": "Updated: Patient confirmed attendance"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - Appointment with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 3.5 Delete Appointment
**Endpoint:** `DELETE /api/appointments/{id}`

**Description:** Permanently deletes an appointment from the system.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the appointment to delete

**Request Headers:**
```
None required
```

**Response Status:** `204 No Content`

**Response Body:**
```
No content
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/appointments/1
```

**Error Responses:**
- `404 Not Found` - Appointment with the given ID does not exist
- `500 Internal Server Error` - Server error

---

## 4. Prescription Management APIs

### 4.1 Create Prescription
**Endpoint:** `POST /api/prescriptions`

**Description:** Creates a new prescription for a patient. Tracks medication details, dosage, frequency, and duration.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "medicationName": "string (required)",
  "dosage": "string (required, e.g., '500mg', '10ml')",
  "frequency": "string (required, e.g., 'Twice daily', 'Once a day', 'Every 8 hours')",
  "startDate": "string (required, format: YYYY-MM-DD)",
  "endDate": "string (required, format: YYYY-MM-DD)",
  "instructions": "string (optional)",
  "doctorName": "string (optional)",
  "notes": "string (optional)",
  "status": "enum (optional, default: ACTIVE, values: ACTIVE, COMPLETED, CANCELLED)"
}
```

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "instructions": "Take with food",
  "doctorName": "Dr. Smith",
  "notes": "Complete full course",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "instructions": "Take with food",
    "doctorName": "Dr. Smith"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors (missing required fields)
- `404 Not Found` - Patient with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 4.2 Get All Prescriptions
**Endpoint:** `GET /api/prescriptions`

**Description:** Retrieves a list of all prescriptions. Supports filtering by patient ID and active status.

**Query Parameters:**
- `patientId` (optional, Long) - Filter prescriptions by patient ID
- `activeOnly` (optional, boolean, default: false) - If true and patientId is provided, returns only active prescriptions for that patient

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "startDate": "2024-01-15",
    "endDate": "2024-01-22",
    "instructions": "Take with food",
    "doctorName": "Dr. Smith",
    "notes": "Complete full course",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Example Requests:**
```bash
# Get all prescriptions
curl -X GET http://localhost:8080/api/prescriptions

# Get prescriptions for a specific patient
curl -X GET "http://localhost:8080/api/prescriptions?patientId=1"

# Get only active prescriptions for a patient
curl -X GET "http://localhost:8080/api/prescriptions?patientId=1&activeOnly=true"
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### 4.3 Get Prescription by ID
**Endpoint:** `GET /api/prescriptions/{id}`

**Description:** Retrieves detailed information about a specific prescription by its unique identifier.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the prescription

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "instructions": "Take with food",
  "doctorName": "Dr. Smith",
  "notes": "Complete full course",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/prescriptions/1
```

**Error Responses:**
- `404 Not Found` - Prescription with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 4.4 Update Prescription
**Endpoint:** `PUT /api/prescriptions/{id}`

**Description:** Updates an existing prescription. Can be used to modify medication details, extend duration, or update status.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the prescription to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicationName": "string (required)",
  "dosage": "string (required)",
  "frequency": "string (required)",
  "startDate": "string (required, format: YYYY-MM-DD)",
  "endDate": "string (required, format: YYYY-MM-DD)",
  "instructions": "string (optional)",
  "doctorName": "string (optional)",
  "notes": "string (optional)",
  "status": "enum (required, values: ACTIVE, COMPLETED, CANCELLED)"
}
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicationName": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "startDate": "2024-01-15",
  "endDate": "2024-01-25",
  "instructions": "Take with food, extended course",
  "doctorName": "Dr. Smith",
  "notes": "Extended by 3 days",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/prescriptions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "medicationName": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "startDate": "2024-01-15",
    "endDate": "2024-01-25",
    "instructions": "Take with food, extended course",
    "status": "ACTIVE"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - Prescription with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 4.5 Delete Prescription
**Endpoint:** `DELETE /api/prescriptions/{id}`

**Description:** Permanently deletes a prescription from the system.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the prescription to delete

**Request Headers:**
```
None required
```

**Response Status:** `204 No Content`

**Response Body:**
```
No content
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/prescriptions/1
```

**Error Responses:**
- `404 Not Found` - Prescription with the given ID does not exist
- `500 Internal Server Error` - Server error

---

## 5. AI Analysis APIs

### 5.1 Create AI Analysis
**Endpoint:** `POST /api/ai-analysis`

**Description:** Creates a new AI-powered medical analysis using Google Gemini AI. The system will process the input data, call the Gemini API with medical context, and store the analysis results. The analysis status will be set to PROCESSING initially, then updated to COMPLETED or FAILED based on the API response.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "medicalRecordId": 1,
  "analysisType": "string (required, e.g., 'Diagnosis Prediction', 'Risk Assessment', 'Treatment Recommendation')",
  "inputData": "string (required, medical data, symptoms, or information to analyze)",
  "modelVersion": "string (optional, defaults to 'v1.0')"
}
```

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicalRecordId": 1,
  "analysisType": "Diagnosis Prediction",
  "inputData": "Patient presents with fever (38.5°C), persistent cough for 5 days, fatigue, and mild shortness of breath.",
  "analysisResult": "Based on the provided symptoms, the patient presents with signs consistent with a respiratory infection. The combination of fever, persistent cough, and fatigue suggests a possible viral or bacterial respiratory condition. Further evaluation including chest X-ray and blood work may be recommended to confirm diagnosis.",
  "confidenceScore": "85%",
  "recommendations": "1. A detailed analysis based on the provided information\n2. Potential diagnoses or conditions to consider\n3. Recommended next steps or follow-up actions",
  "modelVersion": "v1.0",
  "status": "COMPLETED",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:05"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "analysisType": "Diagnosis Prediction",
    "inputData": "Patient presents with fever (38.5°C), persistent cough for 5 days, fatigue, and mild shortness of breath."
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors (missing required fields)
- `404 Not Found` - Patient or medical record with the given ID does not exist
- `500 Internal Server Error` - Server error or Gemini API failure

**Note:** If the Gemini API call fails, the status will be set to FAILED and the analysisResult will contain an error message.

---

### 5.2 Get All AI Analyses
**Endpoint:** `GET /api/ai-analysis`

**Description:** Retrieves a list of all AI analyses. Supports filtering by patient ID or analysis type.

**Query Parameters:**
- `patientId` (optional, Long) - Filter analyses by patient ID
- `analysisType` (optional, string) - Filter analyses by type (e.g., "Diagnosis Prediction")
- Note: If `patientId` is provided, it takes precedence over `analysisType`

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "patientName": "John Doe",
    "medicalRecordId": 1,
    "analysisType": "Diagnosis Prediction",
    "inputData": "Patient presents with fever (38.5°C), persistent cough for 5 days",
    "analysisResult": "Based on the provided symptoms...",
    "confidenceScore": "85%",
    "recommendations": "Further evaluation recommended",
    "modelVersion": "v1.0",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:05"
  }
]
```

**Example Requests:**
```bash
# Get all AI analyses
curl -X GET http://localhost:8080/api/ai-analysis

# Get analyses for a specific patient
curl -X GET "http://localhost:8080/api/ai-analysis?patientId=1"

# Get analyses by type
curl -X GET "http://localhost:8080/api/ai-analysis?analysisType=Diagnosis Prediction"
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### 5.3 Get AI Analysis by ID
**Endpoint:** `GET /api/ai-analysis/{id}`

**Description:** Retrieves detailed information about a specific AI analysis by its unique identifier.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the AI analysis

**Request Headers:**
```
None required
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicalRecordId": 1,
  "analysisType": "Diagnosis Prediction",
  "inputData": "Patient presents with fever (38.5°C), persistent cough for 5 days, fatigue, and mild shortness of breath.",
  "analysisResult": "Based on the provided symptoms, the patient presents with signs consistent with a respiratory infection. The combination of fever, persistent cough, and fatigue suggests a possible viral or bacterial respiratory condition. Further evaluation including chest X-ray and blood work may be recommended to confirm diagnosis.",
  "confidenceScore": "85%",
  "recommendations": "1. A detailed analysis based on the provided information\n2. Potential diagnoses or conditions to consider\n3. Recommended next steps or follow-up actions",
  "modelVersion": "v1.0",
  "status": "COMPLETED",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:05"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/ai-analysis/1
```

**Error Responses:**
- `404 Not Found` - AI analysis with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 5.4 Update AI Analysis
**Endpoint:** `PUT /api/ai-analysis/{id}`

**Description:** Updates an existing AI analysis. Can be used to modify analysis details, update results, or change status.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the AI analysis to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "analysisType": "string (required)",
  "inputData": "string (required)",
  "analysisResult": "string (required)",
  "confidenceScore": "string (required)",
  "recommendations": "string (required)",
  "modelVersion": "string (required)",
  "status": "enum (required, values: PENDING, PROCESSING, COMPLETED, FAILED)"
}
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "medicalRecordId": 1,
  "analysisType": "Diagnosis Prediction",
  "inputData": "Updated input data",
  "analysisResult": "Updated analysis result",
  "confidenceScore": "90%",
  "recommendations": "Updated recommendations",
  "modelVersion": "v1.1",
  "status": "COMPLETED",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8080/api/ai-analysis/1 \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Diagnosis Prediction",
    "inputData": "Updated input data",
    "analysisResult": "Updated analysis result",
    "confidenceScore": "90%",
    "recommendations": "Updated recommendations",
    "modelVersion": "v1.1",
    "status": "COMPLETED"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `404 Not Found` - AI analysis with the given ID does not exist
- `500 Internal Server Error` - Server error

---

### 5.5 Delete AI Analysis
**Endpoint:** `DELETE /api/ai-analysis/{id}`

**Description:** Permanently deletes an AI analysis from the system.

**Path Parameters:**
- `id` (required, Long) - The unique identifier of the AI analysis to delete

**Request Headers:**
```
None required
```

**Response Status:** `204 No Content`

**Response Body:**
```
No content
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/ai-analysis/1
```

**Error Responses:**
- `404 Not Found` - AI analysis with the given ID does not exist
- `500 Internal Server Error` - Server error

---

## 6. Health Check API

### 6.1 Health Check
**Endpoint:** `GET /api/health`

**Description:** Returns the health status of the application. Useful for monitoring and checking if the service is running.

**Request Headers:**
```
None required
```

**Path Parameters:**
```
None
```

**Query Parameters:**
```
None
```

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "status": "UP",
  "service": "Medical AI Backend",
  "timestamp": "2024-01-15T10:30:00"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:8080/api/health
```

**Error Responses:**
- `500 Internal Server Error` - Service is down or experiencing issues

---

## Common Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "firstName": "First name is required",
    "email": "Email should be valid"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Patient not found with id: 1",
  "timestamp": "2024-01-15T10:30:00"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "An error occurred: [error details]",
  "timestamp": "2024-01-15T10:30:00"
}
```

## Running the Application

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### H2 Console
Access the H2 database console at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:medicalai`
- Username: `sa`
- Password: (leave empty)

## Configuration

Edit `src/main/resources/application.properties` to configure:
- Server port
- Database connection (H2 for development, MySQL for production)
- JPA settings
- Logging levels

> **Note:** For detailed API documentation with request/response examples, parameters, and error handling, please refer to the [Complete API Documentation](#complete-api-documentation) section above.

## Gemini AI Integration

The backend is fully integrated with Google's Gemini AI API for medical analysis. The integration includes:

- **GeminiService**: Handles all communication with the Gemini API
- **Medical Context**: Prompts are automatically enhanced with medical context
- **Error Handling**: Graceful error handling for API failures
- **Status Tracking**: Analysis status (PROCESSING, COMPLETED, FAILED) is tracked

### API Key Configuration

The Gemini API key is configured in `application.properties`:
```properties
gemini.api.key=
gemini.api.url=
```

### Using AI Analysis

When creating an AI analysis, the system will:
1. Create an analysis record with PROCESSING status
2. Call the Gemini API with medical context
3. Extract and store the analysis results
4. Update status to COMPLETED or FAILED

Example request:
```json
{
  "patientId": 1,
  "analysisType": "Diagnosis Prediction",
  "inputData": "Patient presents with fever (38.5°C), persistent cough for 5 days, fatigue, and mild shortness of breath."
}
```

## Notes

- **No Authentication**: This backend is built without authentication as requested. In production, you should add proper security.
- **AI Integration**: Fully integrated with Google Gemini AI API for medical analysis.
- **Database**: Uses H2 in-memory database by default. Change to MySQL or PostgreSQL for production.

## License

This project is created for Software Engineering Program at DAU.

