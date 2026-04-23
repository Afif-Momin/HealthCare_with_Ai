#!/bin/bash
# ============================================
# Backend Health Check Script
# ============================================
# Tests your backend deployment on Render
# Usage: ./test-backend-health.sh <your-backend-url>
# Example: ./test-backend-health.sh https://healthcare-backend.onrender.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default URL or from argument
BACKEND_URL="${1:-https://healthcare-backend.onrender.com}"

echo "============================================"
echo "Testing Backend Health: $BACKEND_URL"
echo "============================================"
echo ""

# Test 1: Health Endpoint
echo -e "${YELLOW}Test 1: Health Check Endpoint${NC}"
echo "GET $BACKEND_URL/api/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/health" || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "HTTP_CODE:200"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    echo ""
    echo "Common causes:"
    echo "  - Service is still starting (wait 2-3 minutes)"
    echo "  - Database connection failed (check DATABASE_PASSWORD)"
    echo "  - Port binding issue (should be fixed now)"
    echo "  - Out of memory (check logs)"
    exit 1
fi

echo ""
echo "============================================"

# Test 2: CORS Headers
echo -e "${YELLOW}Test 2: CORS Configuration${NC}"
echo "OPTIONS $BACKEND_URL/api/health"
echo ""

CORS_RESPONSE=$(curl -s -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    -w "\nHTTP_CODE:%{http_code}" \
    "$BACKEND_URL/api/health" || echo "FAILED")

if echo "$CORS_RESPONSE" | grep -q "HTTP_CODE:200"; then
    echo -e "${GREEN}✓ CORS configured correctly${NC}"
else
    echo -e "${RED}✗ CORS check failed${NC}"
    echo "$CORS_RESPONSE"
fi

echo ""
echo "============================================"

# Test 3: Response Time
echo -e "${YELLOW}Test 3: Response Time${NC}"
echo ""

START_TIME=$(date +%s%N)
curl -s "$BACKEND_URL/api/health" > /dev/null
END_TIME=$(date +%s%N)

RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${GREEN}✓ Response time: ${RESPONSE_TIME}ms (Good)${NC}"
elif [ $RESPONSE_TIME -lt 3000 ]; then
    echo -e "${YELLOW}⚠ Response time: ${RESPONSE_TIME}ms (Acceptable)${NC}"
else
    echo -e "${RED}✗ Response time: ${RESPONSE_TIME}ms (Slow - may be cold start)${NC}"
    echo "  Note: First request after 15 min inactivity takes 30-60s on free tier"
fi

echo ""
echo "============================================"

# Test 4: Database Connection
echo -e "${YELLOW}Test 4: Database Connection${NC}"
echo "Testing if backend can connect to database..."
echo ""

# Try to access an endpoint that requires database
DB_TEST=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/users" 2>/dev/null || echo "HTTP_CODE:000")

if echo "$DB_TEST" | grep -q "HTTP_CODE:200\|HTTP_CODE:401\|HTTP_CODE:403"; then
    echo -e "${GREEN}✓ Database connection working${NC}"
    echo "  (Got valid HTTP response from database-dependent endpoint)"
elif echo "$DB_TEST" | grep -q "HTTP_CODE:500"; then
    echo -e "${RED}✗ Database connection may be failing${NC}"
    echo "  Check DATABASE_PASSWORD in Render dashboard"
    echo "  Verify Neon database is active"
else
    echo -e "${YELLOW}⚠ Could not verify database connection${NC}"
    echo "  Endpoint may not exist or require authentication"
fi

echo ""
echo "============================================"
echo -e "${GREEN}Health check complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. If all tests passed, your backend is working correctly"
echo "  2. Update frontend VITE_API_BASE_URL to: $BACKEND_URL/api"
echo "  3. Check logs if any tests failed: render logs healthcare-backend"
echo ""
echo "Render Dashboard: https://dashboard.render.com"
echo "============================================"
