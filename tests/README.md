# Healthcare AI Platform - Testing Suite

## 📋 Overview

Comprehensive testing suite for all backend modules. Tests each endpoint and generates detailed reports with pass/fail status.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tests
pip install -r requirements.txt
```

### 2. Start Backend Server

Make sure your Spring Boot backend is running:

```bash
cd BackEnd
mvn spring-boot:run
```

Or if using Docker:

```bash
docker-compose up backend
```

The backend should be accessible at `http://localhost:8080`

### 3. Run Tests

#### Run All Module Tests
```bash
python test_all_modules.py
```

#### Run Individual Module Tests
```bash
# Authentication module
python test_authentication.py

# Patients module
python test_patients.py

# Add more as needed
```

---

## 📁 Test Files

| File | Description | Modules Tested |
|------|-------------|----------------|
| `test_all_modules.py` | Comprehensive test suite | All 16 modules |
| `test_authentication.py` | Authentication tests | Login, Register, Profile |
| `test_patients.py` | Patient management tests | CRUD operations |
| `requirements.txt` | Python dependencies | - |

---

## 🧪 Test Modules Covered

### 1. Health Check
- Backend health endpoint
- Service status verification

### 2. Authentication
- Login (Doctor, Nurse, Patient, Admin)
- Invalid credentials
- User profile retrieval
- Registration
- OTP verification

### 3. Patients Management
- Get all patients
- Search patients
- Create patient
- Update patient
- Delete patient
- Get patient by ID

### 4. Medical Records
- Get all records
- Filter by type
- Create record
- Update record

### 5. Appointments
- Get all appointments
- Filter by status
- Create appointment
- Update appointment

### 6. Prescriptions
- Get all prescriptions
- Filter active prescriptions
- Create prescription
- Update prescription

### 7. AI Analysis
- Get all analyses
- Filter by type
- Create analysis

### 8. Digital Twin
- Get digital twin for patient
- Simulate health scenarios

### 9. Health Story
- Get health story
- Ask questions (Gemini AI)

### 10. What-If Simulator
- Weight loss scenarios
- Exercise scenarios
- Medication scenarios

### 11. Population Intelligence
- Analyze all patients
- Trend detection

### 12. Early Warning System
- Outbreak detection
- Risk assessment

### 13. Hospital Connector
- Find nearest hospitals
- Send patient profile

### 14. Predictive Timeline
- Generate timeline
- What-if scenarios
- Get interventions

### 15. SOS Emergency
- Trigger emergency alert
- Send location

### 16. AI Service (FastAPI)
- Health check
- Model availability

---

## 📊 Test Output

### Console Output

Tests display real-time results with color coding:
- ✅ Green: Passed tests
- ❌ Red: Failed tests
- ⚠️ Yellow: Warnings

Example:
```
================================================================================
                    HEALTHCARE AI PLATFORM - MODULE TESTING
================================================================================

Configuration:
  Backend URL: http://localhost:8080/api
  AI Service URL: http://localhost:8000
  Test User: doctor@healthcare.com

────────────────────────────────────────────────────────────────────────────────
Testing Module: Authentication
────────────────────────────────────────────────────────────────────────────────

✓ PASS Login with Valid Credentials
   Method: POST | Endpoint: /auth/login
   Status: 200 (Expected: 200) | Time: 0.234s

✗ FAIL Login with Invalid Credentials
   Method: POST | Endpoint: /auth/login
   Status: 401 (Expected: 401) | Time: 0.156s
```

### JSON Reports

Each test run generates a detailed JSON report:

```json
{
  "timestamp": "20260423_143022",
  "summary": {
    "total": 45,
    "passed": 42,
    "failed": 3,
    "pass_rate": 93.3
  },
  "modules": {
    "Authentication": {
      "passed": 8,
      "failed": 0,
      "total": 8
    },
    "Patients": {
      "passed": 7,
      "failed": 1,
      "total": 8
    }
  },
  "detailed_results": [...]
}
```

### Summary Table

```
┌────┬─────────────────────────┬───────┬────────┬────────┬───────────┐
│    │ Module                  │ Total │ Passed │ Failed │ Pass Rate │
├────┼─────────────────────────┼───────┼────────┼────────┼───────────┤
│ ✓  │ Health Check            │     1 │      1 │      0 │   100.0%  │
│ ✓  │ Authentication          │     8 │      8 │      0 │   100.0%  │
│ ✗  │ Patients                │     8 │      7 │      1 │    87.5%  │
│ ✓  │ Medical Records         │     3 │      3 │      0 │   100.0%  │
└────┴─────────────────────────┴───────┴────────┴────────┴───────────┘
```

---

## 🔧 Configuration

### Change Backend URL

Edit the test file:

```python
BASE_URL = "http://localhost:8080/api"  # Change this
AI_BASE_URL = "http://localhost:8000"   # Change this
```

### Change Test Credentials

```python
self.test_user_email = "doctor@healthcare.com"
self.test_user_password = "doctor123"
```

---

## 📸 For SE Project Submission

### Required Screenshots

For each module, capture:

1. **Code Screenshot**
   - Open the test file in your editor
   - Capture the test functions
   - Example: `test_authentication.py` showing test cases

2. **Test Execution Screenshot**
   - Run the test: `python test_authentication.py`
   - Capture the console output showing:
     - Test names
     - Pass/fail status
     - Response codes
     - Summary table

3. **Test Report Screenshot**
   - Open the generated JSON report
   - Show the summary and detailed results

### Example Structure

```
Module 1: Authentication
├── Screenshot 1: test_authentication.py code
├── Screenshot 2: Test execution output
└── Screenshot 3: test_authentication_report.json

Module 2: Patients
├── Screenshot 1: test_patients.py code
├── Screenshot 2: Test execution output
└── Screenshot 3: test_patients_report.json

... (repeat for all modules)
```

---

## 🐛 Troubleshooting

### Backend Not Running

**Error:** `Connection refused` or `Connection error`

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8080/api/health

# If not, start it
cd BackEnd
mvn spring-boot:run
```

### Authentication Failed

**Error:** `Authentication failed - some tests may fail`

**Solution:**
- Verify default users exist in database
- Check credentials in test file
- Ensure DataInitializer ran successfully

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'requests'`

**Solution:**
```bash
pip install -r requirements.txt
```

### Timeout Errors

**Error:** `Request timeout`

**Solution:**
- Backend may be slow to start (wait 2-3 minutes)
- Increase timeout in test file:
  ```python
  response = requests.get(url, timeout=30)  # Increase from 10
  ```

---

## 📝 Adding New Tests

### Create New Test File

```python
#!/usr/bin/env python3
import requests
from colorama import init, Fore

init(autoreset=True)

BASE_URL = "http://localhost:8080/api"

class MyModuleTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def test(self, name, method, endpoint, data=None, expected_status=200):
        # Test implementation
        pass
    
    def run_tests(self):
        print(f"\n{Fore.CYAN}MY MODULE TESTING\n")
        
        # Add your tests here
        self.test("Test Name", "GET", "/my-endpoint")
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        # Report generation
        pass

if __name__ == "__main__":
    tester = MyModuleTester()
    tester.run_tests()
```

---

## ✅ Test Checklist

Before submission, ensure:

- [ ] All dependencies installed
- [ ] Backend server running
- [ ] All tests executed successfully
- [ ] Screenshots captured for each module
- [ ] JSON reports generated
- [ ] Test results documented
- [ ] Error cases tested
- [ ] Pass rates calculated

---

## 📚 Additional Resources

- **Backend API Documentation:** See `BackEnd/README.md`
- **Deployment Guide:** See `PRODUCTION_READY.md`
- **Login Credentials:** See `LOGIN_CREDENTIALS.md`

---

## 🎯 Expected Results

### Minimum Pass Rate

- **Critical Modules:** 100% (Health, Authentication)
- **Core Modules:** 90%+ (Patients, Medical Records, Appointments)
- **Advanced Modules:** 80%+ (AI Analysis, Digital Twin, etc.)

### Common Failures

Some tests may fail if:
- Database is empty (no patients for testing)
- AI service not running (FastAPI tests)
- Email service not configured (OTP tests)
- External APIs unavailable (Gemini AI)

These are expected and documented in the report.

---

**Ready to test! Run `python test_all_modules.py` to start! 🚀**
