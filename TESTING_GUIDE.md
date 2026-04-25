# 🧪 Healthcare AI Platform - Complete Testing Guide

## 📋 For SE Project Submission

This guide helps you test all modules and capture screenshots for your project submission.

---

## 🚀 Quick Start

### Step 1: Install Testing Tools

```bash
cd tests
pip install -r requirements.txt
```

**Required packages:**
- `requests` - HTTP client
- `colorama` - Colored terminal output
- `tabulate` - Table formatting
- `Pillow` - Image handling (optional)

### Step 2: Start Backend Server

**Option A: Using Maven**
```bash
cd BackEnd
mvn spring-boot:run
```

**Option B: Using IDE**
- Open `BackEnd` folder in IntelliJ IDEA or Eclipse
- Run `MedicalAiBackendApplication.java`

**Verify backend is running:**
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Medical AI Backend",
  "timestamp": "2026-04-23T..."
}
```

### Step 3: Run Tests

**Run all tests:**
```bash
cd tests
python test_all_modules.py
```

**Run specific module:**
```bash
python test_authentication.py
python test_patients.py
```

**Using setup script (Linux/Mac):**
```bash
./setup_and_run.sh
```

**Using setup script (Windows):**
```bash
setup_and_run.bat
```

---

## 📸 Screenshot Guide for Submission

### For Each Module, Capture 3 Screenshots:

#### Screenshot 1: Test Code
- Open the test file (e.g., `test_authentication.py`)
- Show the test functions
- Highlight key test cases
- **File:** `Module_X_Code.png`

#### Screenshot 2: Test Execution
- Run the test in terminal
- Show the output with:
  - Test names
  - Pass/fail indicators (✓/✗)
  - Status codes
  - Response times
  - Summary table
- **File:** `Module_X_Execution.png`

#### Screenshot 3: Test Report
- Open the generated JSON report
- Show the summary section
- Show detailed results
- **File:** `Module_X_Report.png`

---

## 📁 Module Testing Checklist

### ✅ Module 1: Health Check
```bash
python test_all_modules.py
```
**Tests:**
- Backend health endpoint
- Service status verification

**Screenshots:**
1. Code showing health check test
2. Execution showing ✓ PASS
3. JSON report with status: "UP"

---

### ✅ Module 2: Authentication
```bash
python test_authentication.py
```
**Tests:**
- Login with valid credentials (Doctor, Nurse, Patient, Admin)
- Login with invalid credentials
- Get user profile
- Registration
- Duplicate email handling

**Expected Results:**
- Valid logins: ✓ PASS (200)
- Invalid logins: ✓ PASS (401)
- Profile retrieval: ✓ PASS (200)
- Registration: ✓ PASS (200)

**Screenshots:**
1. `test_authentication.py` code
2. Terminal showing all 14 tests
3. `test_authentication_report.json`

---

### ✅ Module 3: Patients Management
```bash
python test_patients.py
```
**Tests:**
- Get all patients
- Search patients
- Create patient
- Update patient
- Delete patient
- Get patient by ID
- Duplicate email handling
- Missing fields validation

**Expected Results:**
- CRUD operations: ✓ PASS (200/201)
- Validation errors: ✓ PASS (400)
- Not found: ✓ PASS (404)

**Screenshots:**
1. `test_patients.py` code
2. Terminal showing all tests
3. `test_patients_report.json`

---

### ✅ Module 4: Medical Records
**Tests:**
- Get all records
- Filter by type
- Create record
- Update record

---

### ✅ Module 5: Appointments
**Tests:**
- Get all appointments
- Filter by status
- Create appointment
- Update appointment

---

### ✅ Module 6: Prescriptions
**Tests:**
- Get all prescriptions
- Filter active prescriptions
- Create prescription
- Update prescription

---

### ✅ Module 7: AI Analysis
**Tests:**
- Get all analyses
- Filter by type
- Create analysis

---

### ✅ Module 8: Digital Twin
**Tests:**
- Get digital twin for patient
- Simulate health scenarios

---

### ✅ Module 9: Health Story
**Tests:**
- Get health story
- Ask questions (Gemini AI)

---

### ✅ Module 10: What-If Simulator
**Tests:**
- Weight loss scenarios
- Exercise scenarios
- Medication scenarios

---

### ✅ Module 11: Population Intelligence
**Tests:**
- Analyze all patients
- Trend detection

---

### ✅ Module 12: Early Warning System
**Tests:**
- Outbreak detection
- Risk assessment

---

### ✅ Module 13: Hospital Connector
**Tests:**
- Find nearest hospitals
- Send patient profile

---

### ✅ Module 14: Predictive Timeline
**Tests:**
- Generate timeline
- What-if scenarios
- Get interventions

---

### ✅ Module 15: SOS Emergency
**Tests:**
- Trigger emergency alert
- Send location

---

### ✅ Module 16: AI Service (FastAPI)
**Tests:**
- Health check
- Model availability

---

## 📊 Understanding Test Results

### Pass Indicators
```
✓ PASS Test Name
   Method: POST | Endpoint: /api/auth/login
   Status: 200 (Expected: 200) | Time: 0.234s
```

### Fail Indicators
```
✗ FAIL Test Name
   Method: POST | Endpoint: /api/auth/login
   Status: 500 (Expected: 200) | Time: 0.156s
   Response: {"error": "Internal server error"}
```

### Summary Table
```
┌────┬─────────────────────────┬───────┬────────┬────────┬───────────┐
│    │ Module                  │ Total │ Passed │ Failed │ Pass Rate │
├────┼─────────────────────────┼───────┼────────┼────────┼───────────┤
│ ✓  │ Authentication          │     8 │      8 │      0 │   100.0%  │
│ ✗  │ Patients                │     8 │      7 │      1 │    87.5%  │
└────┴─────────────────────────┴───────┴────────┴────────┴───────────┘
```

---

## 📝 Test Report Structure

### JSON Report Format
```json
{
  "module": "Authentication",
  "total": 14,
  "passed": 13,
  "failed": 1,
  "pass_rate": 92.9,
  "results": [
    {
      "test": "Login - Valid Doctor Credentials",
      "status": "✓ PASS",
      "code": 200,
      "expected": 200,
      "response": "{\"success\":true,\"token\":\"DOCTOR-1-...\"}"
    }
  ]
}
```

---

## 🎯 Expected Pass Rates

### Critical Modules (Must be 100%)
- ✅ Health Check: 100%
- ✅ Authentication: 100%

### Core Modules (Should be 90%+)
- ✅ Patients: 90%+
- ✅ Medical Records: 90%+
- ✅ Appointments: 90%+
- ✅ Prescriptions: 90%+

### Advanced Modules (Should be 80%+)
- ✅ AI Analysis: 80%+
- ✅ Digital Twin: 80%+
- ✅ Health Story: 80%+
- ✅ What-If Simulator: 80%+

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Not Running
**Error:** `Connection refused`

**Solution:**
```bash
# Start backend
cd BackEnd
mvn spring-boot:run

# Wait 2-3 minutes for startup
# Then run tests
```

### Issue 2: Authentication Failed
**Error:** `Authentication failed - some tests may fail`

**Solution:**
- Check default users exist
- Verify credentials: `doctor@healthcare.com` / `doctor123`
- Check database initialization logs

### Issue 3: Database Empty
**Error:** `404 Not Found` for patient tests

**Solution:**
- Database needs default data
- Run DataInitializer
- Or create test data manually

### Issue 4: Import Errors
**Error:** `ModuleNotFoundError: No module named 'requests'`

**Solution:**
```bash
pip install -r requirements.txt
```

---

## 📦 Submission Package Structure

```
SE_Project_Testing/
├── Module_01_Health_Check/
│   ├── 01_Code.png
│   ├── 02_Execution.png
│   └── 03_Report.png
├── Module_02_Authentication/
│   ├── 01_Code.png
│   ├── 02_Execution.png
│   └── 03_Report.png
├── Module_03_Patients/
│   ├── 01_Code.png
│   ├── 02_Execution.png
│   └── 03_Report.png
├── ... (repeat for all 16 modules)
├── test_all_modules.py
├── test_authentication.py
├── test_patients.py
├── requirements.txt
└── README.md
```

---

## ✅ Pre-Submission Checklist

- [ ] All dependencies installed
- [ ] Backend server running
- [ ] All test files executed
- [ ] Screenshots captured for each module
- [ ] JSON reports generated
- [ ] Pass rates documented
- [ ] Error cases tested
- [ ] Test code reviewed
- [ ] Reports organized in folders
- [ ] README included

---

## 🎓 Tips for Better Screenshots

### Code Screenshots
- Use syntax highlighting
- Show complete test functions
- Include comments
- Use readable font size (14-16pt)

### Execution Screenshots
- Capture full terminal output
- Show test names clearly
- Include summary table
- Show pass/fail indicators

### Report Screenshots
- Show JSON structure
- Highlight key metrics
- Include timestamp
- Show detailed results

---

## 📞 Support

If you encounter issues:

1. Check `tests/README.md` for detailed instructions
2. Review `PRODUCTION_READY.md` for backend setup
3. Check `LOGIN_CREDENTIALS.md` for test credentials
4. Verify backend logs for errors

---

## 🎉 Success Criteria

Your testing is complete when:

- ✅ All 16 modules tested
- ✅ Pass rate > 85% overall
- ✅ Critical modules at 100%
- ✅ All screenshots captured
- ✅ JSON reports generated
- ✅ Documentation complete

---

**Ready to test! Start with `python test_all_modules.py` 🚀**
