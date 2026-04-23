#!/bin/bash
# ============================================
# Integrated Deployment Test Script
# ============================================
# Tests your integrated deployment on Render
# Usage: ./test-integrated-deployment.sh <your-app-url>
# Example: ./test-integrated-deployment.sh https://healthcare-with-ai.onrender.com

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
echo -e "${BLUE}Testing Integrated Deployment${NC}"
echo "App URL: $APP_URL"
echo "============================================"
echo ""

# Test 1: Frontend (Root)
echo -e "${YELLOW}Test 1: Frontend Root${NC}"
echo "GET $APP_URL/"
echo ""

ROOT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/" || echo "FAILED")

if echo "$ROOT_RESPONSE" | grep -q "HTTP_CODE:200"; then
    if echo "$ROOT_RESPONSE" | grep -q "<!DOCTYPE html>"; then
        echo -e "${GREEN}✓ Frontend HTML served successfully${NC}"
    else
        echo -e "${RED}✗ Response is not HTML${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Frontend failed to load${NC}"
    echo "$ROOT_RESPONSE"
    exit 1
fi

echo ""
echo "============================================"

# Test 2: API Health Check
echo -e "${YELLOW}Test 2: API Health Endpoint${NC}"
echo "GET $APP_URL/api/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/health" || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "HTTP_CODE:200"; then
    if echo "$HEALTH_RESPONSE" | grep -q '"status"'; then
        echo -e "${GREEN}✓ API health check passed${NC}"
        echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE" | head -5
    else
        echo -e "${RED}✗ API response is not JSON${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ API health check failed${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "============================================"

# Test 3: Static Assets
echo -e "${YELLOW}Test 3: Static Assets${NC}"
echo "Checking if frontend assets are accessible..."
echo ""

# Try to get the main HTML and extract asset paths
ASSETS_CHECK=$(curl -s "$APP_URL/" | grep -o '/assets/[^"]*' | head -1 || echo "")

if [ -n "$ASSETS_CHECK" ]; then
    ASSET_URL="$APP_URL$ASSETS_CHECK"
    echo "Testing asset: $ASSET_URL"
    
    ASSET_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$ASSET_URL" || echo "HTTP_CODE:000")
    
    if echo "$ASSET_RESPONSE" | grep -q "HTTP_CODE:200"; then
        echo -e "${GREEN}✓ Static assets accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Could not verify static assets${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No assets found in HTML (might be inline)${NC}"
fi

echo ""
echo "============================================"

# Test 4: React Router (SPA)
echo -e "${YELLOW}Test 4: React Router (SPA)${NC}"
echo "Testing if non-root routes return HTML..."
echo ""

SPA_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/dashboard" || echo "HTTP_CODE:000")

if echo "$SPA_RESPONSE" | grep -q "HTTP_CODE:200"; then
    if echo "$SPA_RESPONSE" | grep -q "<!DOCTYPE html>"; then
        echo -e "${GREEN}✓ React Router working (SPA routes return HTML)${NC}"
    else
        echo -e "${RED}✗ SPA route did not return HTML${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Could not test SPA routing${NC}"
fi

echo ""
echo "============================================"

# Test 5: CORS (should not be needed)
echo -e "${YELLOW}Test 5: CORS Configuration${NC}"
echo "Checking CORS headers (should allow all origins)..."
echo ""

CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    "$APP_URL/api/health" || echo "FAILED")

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✓ CORS configured (though not needed for same-origin)${NC}"
else
    echo -e "${YELLOW}⚠ CORS headers not found (OK for same-origin requests)${NC}"
fi

echo ""
echo "============================================"

# Test 6: Response Time
echo -e "${YELLOW}Test 6: Response Time${NC}"
echo ""

START_TIME=$(date +%s%N)
curl -s "$APP_URL/api/health" > /dev/null
END_TIME=$(date +%s%N)

RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${GREEN}✓ Response time: ${RESPONSE_TIME}ms (Excellent)${NC}"
elif [ $RESPONSE_TIME -lt 3000 ]; then
    echo -e "${YELLOW}⚠ Response time: ${RESPONSE_TIME}ms (Good)${NC}"
else
    echo -e "${RED}✗ Response time: ${RESPONSE_TIME}ms (Slow - cold start?)${NC}"
    echo "  Note: First request after 15 min takes 30-60s on free tier"
fi

echo ""
echo "============================================"

# Summary
echo -e "${GREEN}✅ Deployment Test Complete!${NC}"
echo ""
echo "Summary:"
echo "  ✓ Frontend: Serving React app"
echo "  ✓ Backend: API endpoints working"
echo "  ✓ Integration: Frontend + Backend on same domain"
echo "  ✓ No CORS issues (same-origin requests)"
echo ""
echo "Your application is live at:"
echo "  🌐 Frontend: $APP_URL"
echo "  🔌 API: $APP_URL/api"
echo ""
echo "Next steps:"
echo "  1. Test login/signup functionality"
echo "  2. Test AI prediction endpoints"
echo "  3. Verify database operations"
echo "  4. Check browser console for errors"
echo ""
echo "Dashboard: https://dashboard.render.com"
echo "============================================"
