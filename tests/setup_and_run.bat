@echo off
REM Healthcare AI Platform - Test Setup and Execution (Windows)
REM =============================================================

echo ================================================================
echo   Healthcare AI Platform - Testing Suite Setup
echo ================================================================
echo.

REM Step 1: Check Python
echo Step 1: Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
python --version
echo [OK] Python found
echo.

REM Step 2: Install dependencies
echo Step 2: Installing test dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Check backend
echo Step 3: Checking backend server...
curl -s -f -o nul http://localhost:8080/api/health
if %errorlevel% neq 0 (
    echo [WARNING] Backend server not responding
    echo Please start the backend server:
    echo   cd BackEnd
    echo   mvn spring-boot:run
    echo.
    pause
)
echo [OK] Backend server is running
echo.

REM Step 4: Run tests
echo Step 4: Running tests...
echo.
echo Choose test suite:
echo   1) Run all modules (comprehensive)
echo   2) Run authentication tests only
echo   3) Run patients tests only
echo   4) Exit
echo.
set /p choice="Enter choice [1-4]: "

if "%choice%"=="1" (
    echo Running all module tests...
    python test_all_modules.py
) else if "%choice%"=="2" (
    echo Running authentication tests...
    python test_authentication.py
) else if "%choice%"=="3" (
    echo Running patients tests...
    python test_patients.py
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice
    pause
    exit /b 1
)

echo.
echo ================================================================
echo   Testing Complete! Check the generated JSON reports.
echo ================================================================
pause
