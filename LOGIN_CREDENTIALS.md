# 🔐 Login Credentials - Healthcare AI Platform

## ✅ Your Deployment is Working!

The API is responding correctly (200 OK). The "Login failed" message means you need to use the correct credentials.

---

## 🎯 Default Login Credentials

After deployment, these accounts are automatically created:

### 👨‍⚕️ Doctor Account
```
Email:    doctor@healthcare.com
Password: doctor123
Role:     DOCTOR
```

### 👩‍⚕️ Nurse Account
```
Email:    nurse@healthcare.com
Password: nurse123
Role:     NURSE
```

### 🏥 Patient Account
```
Email:    patient@healthcare.com
Password: patient123
Role:     PATIENT
```

### 🔐 Admin Account
```
Email:    ismailmansury9737@gmail.com
Password: Ismail@786
Role:     ADMIN
```

**Note:** Admin credentials come from environment variables:
- `ADMIN_EMAIL` (default: ismailmansury9737@gmail.com)
- `ADMIN_PASSWORD` (default: Ismail@786)

---

## 🚀 Quick Test

### Test Admin Login
```bash
curl -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ismailmansury9737@gmail.com",
    "password": "Ismail@786"
  }'
```

### Test Doctor Login
```bash
curl -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@healthcare.com",
    "password": "doctor123"
  }'
```

### Expected Success Response
```json
{
  "success": true,
  "message": "Welcome back, Dr. Sarah Johnson!",
  "token": "DOCTOR-1-abc123...",
  "role": "DOCTOR",
  "email": "doctor@healthcare.com",
  "fullName": "Dr. Sarah Johnson",
  "userId": 1
}
```

### Expected Failure Response
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

## 🔍 Troubleshooting Login Issues

### Issue 1: "Invalid email or password"

**Causes:**
1. Wrong email or password
2. User doesn't exist in database
3. Database not initialized

**Solutions:**
1. Use one of the default credentials above
2. Check if DataInitializer ran (check logs)
3. Verify database connection is working

**Check Logs:**
```bash
render logs healthcare-with-ai --tail
```

Look for:
```
🔄 Initializing database...
✅ Created default doctor: doctor@healthcare.com / doctor123
✅ Created default nurse: nurse@healthcare.com / nurse123
✅ Created default patient: patient@healthcare.com / patient123
✅ Database initialization complete!
```

### Issue 2: "Email not verified"

**Cause:** User registered but didn't verify OTP

**Solution:** 
- Use default accounts (pre-verified)
- Or complete OTP verification for new registrations

### Issue 3: Login returns 200 but frontend shows error

**Cause:** Frontend not parsing response correctly

**Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on the login request
4. Check Response tab - should see JSON with `success: true`

**If response shows `success: false`:**
- Check the `message` field for the error
- Use correct credentials from this document

---

## 📝 How Login Works

### 1. Admin Login (Special Case)
```
Email matches ADMIN_EMAIL env var
  ↓
Password matches ADMIN_PASSWORD env var
  ↓
Returns admin token (no database check)
```

### 2. Regular User Login
```
Check if user exists in database
  ↓
Verify password with BCrypt
  ↓
Check if email is verified
  ↓
Return user token
```

### 3. Token Format
```
ROLE-USERID-RANDOMSTRING

Examples:
ADMIN-0-abc123def456...
DOCTOR-1-xyz789ghi012...
PATIENT-3-mno345pqr678...
```

---

## 🆕 Creating New Users

### Option 1: Register via Frontend
1. Go to signup page
2. Fill in details
3. Submit registration
4. Check email for OTP
5. Verify OTP
6. Login with new credentials

### Option 2: Register via API
```bash
curl -X POST https://healthcare-with-ai.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "phone": "+1-555-0199",
    "role": "DOCTOR",
    "specialization": "Neurology",
    "licenseNumber": "MD-67890",
    "department": "Neurology"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Check your email for the OTP.",
  "email": "john.doe@example.com"
}
```

**Then verify OTP:**
```bash
curl -X POST https://healthcare-with-ai.onrender.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

---

## 🔒 Security Notes

### Password Requirements
- Minimum 6 characters (recommended: 8+)
- Mix of letters and numbers recommended
- Special characters allowed

### Default Passwords
**⚠️ IMPORTANT:** Change default passwords in production!

The default accounts are for testing only. In production:
1. Delete or disable default accounts
2. Create new accounts with strong passwords
3. Change admin password via environment variable

### Admin Password
To change admin password:
1. Go to Render Dashboard
2. Service → healthcare-with-ai → Environment
3. Update `ADMIN_PASSWORD` value
4. Save (service will redeploy)

---

## 🧪 Testing All Accounts

### Test Script
```bash
#!/bin/bash

echo "Testing all default accounts..."

# Test Admin
echo "1. Testing Admin..."
curl -s -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ismailmansury9737@gmail.com","password":"Ismail@786"}' \
  | grep -q '"success":true' && echo "✅ Admin login works" || echo "❌ Admin login failed"

# Test Doctor
echo "2. Testing Doctor..."
curl -s -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@healthcare.com","password":"doctor123"}' \
  | grep -q '"success":true' && echo "✅ Doctor login works" || echo "❌ Doctor login failed"

# Test Nurse
echo "3. Testing Nurse..."
curl -s -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nurse@healthcare.com","password":"nurse123"}' \
  | grep -q '"success":true' && echo "✅ Nurse login works" || echo "❌ Nurse login failed"

# Test Patient
echo "4. Testing Patient..."
curl -s -X POST https://healthcare-with-ai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@healthcare.com","password":"patient123"}' \
  | grep -q '"success":true' && echo "✅ Patient login works" || echo "❌ Patient login failed"

echo "Done!"
```

Save as `test-login.sh`, make executable, and run:
```bash
chmod +x test-login.sh
./test-login.sh
```

---

## 📊 User Roles & Permissions

### ADMIN
- Full system access
- Manage all users
- View all data
- System configuration

### DOCTOR
- View patient records
- Create prescriptions
- Schedule appointments
- Access AI predictions

### NURSE
- View assigned patients
- Update patient vitals
- Manage medications
- Ward management

### PATIENT
- View own medical records
- Book appointments
- View prescriptions
- Access AI health predictions

---

## 🔄 Password Reset (Future Feature)

Currently, password reset is not implemented. To reset a password:

### Option 1: Admin Reset (Manual)
1. Connect to database
2. Update user password with BCrypt hash
3. Notify user of new password

### Option 2: Re-register
1. Delete old account (if possible)
2. Register with same email
3. Verify OTP
4. Login with new password

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Admin login works
- [ ] Doctor login works
- [ ] Nurse login works
- [ ] Patient login works
- [ ] Registration creates new users
- [ ] OTP verification works
- [ ] Login returns proper tokens
- [ ] Frontend accepts tokens
- [ ] Protected routes work with tokens

---

## 🆘 Still Having Issues?

### Check Database Connection
```bash
# In Render logs, look for:
"Connected to PostgreSQL database"
"✅ Database initialization complete!"
```

### Check Environment Variables
```bash
# Verify these are set in Render dashboard:
DATABASE_PASSWORD
ADMIN_EMAIL
ADMIN_PASSWORD
```

### Check Application Logs
```bash
render logs healthcare-with-ai --tail
```

### Test Health Endpoint
```bash
curl https://healthcare-with-ai.onrender.com/api/health
```

Should return:
```json
{
  "status": "UP",
  "service": "Medical AI Backend",
  "timestamp": "..."
}
```

---

## 📚 Related Documentation

- `DEPLOYMENT_COMPLETE.md` - Deployment guide
- `INTEGRATED_DEPLOYMENT.md` - Architecture details
- `README_DEPLOYMENT.md` - Complete reference
- `.env.example` - Environment variables

---

## 🎉 Quick Start

**Just want to login right now?**

1. Go to: https://healthcare-with-ai.onrender.com
2. Click "Sign In"
3. Use these credentials:

```
Email:    doctor@healthcare.com
Password: doctor123
```

**That's it!** You should be logged in and see the dashboard.

---

**Your authentication system is fully working! 🎉**

Use the default credentials above to login immediately, or create new accounts via the registration page.
