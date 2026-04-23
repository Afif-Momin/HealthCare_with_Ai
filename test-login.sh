#!/bin/bash
# ============================================
# Login Test Script
# ============================================
# Tests all default login accounts
# Usage: ./test-login.sh <your-app-url>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default URL or from argument
APP_URL="${1:-https://healthcare-with-ai.onrender.com}"

echo "============================================"
echo -e "${BLUE}Testing Login Credentials${NC}"
echo "App URL: $APP_URL"
echo "============================================"
echo ""

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local role=$3
    
    echo -e "${YELLOW}Testing $role Login${NC}"
    echo "Email: $email"
    
    RESPONSE=$(curl -s -X POST "$APP_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ $role login successful${NC}"
        # Extract and show token (first 50 chars)
        TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | head -c 50)
        echo "   Token: ${TOKEN}..."
        echo ""
        return 0
    else
        echo -e "${RED}❌ $role login failed${NC}"
        MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo "   Error: $MESSAGE"
        echo "   Full response: $RESPONSE"
        echo ""
        return 1
    fi
}

# Test all accounts
PASSED=0
FAILED=0

# Test 1: Admin
if test_login "ismailmansury9737@gmail.com" "Ismail@786" "Admin"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 2: Doctor
if test_login "doctor@healthcare.com" "doctor123" "Doctor"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 3: Nurse
if test_login "nurse@healthcare.com" "nurse123" "Nurse"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Test 4: Patient
if test_login "patient@healthcare.com" "patient123" "Patient"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Summary
echo "============================================"
echo -e "${BLUE}Test Summary${NC}"
echo "============================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All login tests passed!${NC}"
    echo ""
    echo "You can now login with any of these accounts:"
    echo "  👨‍⚕️  Doctor:  doctor@healthcare.com  / doctor123"
    echo "  👩‍⚕️  Nurse:   nurse@healthcare.com   / nurse123"
    echo "  🏥  Patient: patient@healthcare.com / patient123"
    echo "  🔐  Admin:   ismailmansury9737@gmail.com / Ismail@786"
else
    echo -e "${RED}⚠️  Some login tests failed${NC}"
    echo ""
    echo "Possible causes:"
    echo "  1. Database not initialized (check logs)"
    echo "  2. Database connection failed"
    echo "  3. Service still starting up (wait 1-2 minutes)"
    echo ""
    echo "Check logs:"
    echo "  render logs healthcare-with-ai --tail"
    echo ""
    echo "Look for:"
    echo "  ✅ Database initialization complete!"
fi

echo "============================================"
