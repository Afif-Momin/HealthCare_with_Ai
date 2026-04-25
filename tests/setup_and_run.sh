#!/bin/bash
# Healthcare AI Platform - Test Setup and Execution
# ==================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Healthcare AI Platform - Testing Suite Setup                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Python
echo -e "${BLUE}Step 1: Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing test dependencies...${NC}"
pip3 install -r requirements.txt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 3: Check backend
echo -e "${BLUE}Step 3: Checking backend server...${NC}"
BACKEND_URL="http://localhost:8080/api/health"

if curl -s -f -o /dev/null "$BACKEND_URL"; then
    echo -e "${GREEN}✓ Backend server is running${NC}"
else
    echo -e "${YELLOW}⚠ Backend server not responding at $BACKEND_URL${NC}"
    echo -e "${YELLOW}  Please start the backend server:${NC}"
    echo -e "${YELLOW}    cd BackEnd${NC}"
    echo -e "${YELLOW}    mvn spring-boot:run${NC}"
    echo ""
    read -p "Press Enter when backend is ready, or Ctrl+C to exit..."
fi
echo ""

# Step 4: Run tests
echo -e "${BLUE}Step 4: Running tests...${NC}"
echo ""
echo "Choose test suite:"
echo "  1) Run all modules (comprehensive)"
echo "  2) Run authentication tests only"
echo "  3) Run patients tests only"
echo "  4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo -e "${GREEN}Running all module tests...${NC}"
        python3 test_all_modules.py
        ;;
    2)
        echo -e "${GREEN}Running authentication tests...${NC}"
        python3 test_authentication.py
        ;;
    3)
        echo -e "${GREEN}Running patients tests...${NC}"
        python3 test_patients.py
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Testing Complete! Check the generated JSON reports.          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
