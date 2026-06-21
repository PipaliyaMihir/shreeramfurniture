@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo    SHREE RAM FURNITURE - System Check
echo ===============================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/ first.
    pause
    exit /b
)
echo [OK] Node.js is installed.

:: 2. Check and install backend dependencies if node_modules is missing
if not exist "d:\ShreeRamFurniture\server\node_modules\" (
    echo [INFO] Backend node_modules not found. Installing...
    cd /d d:\ShreeRamFurniture\server && npm install
)

:: 3. Check and install frontend dependencies if node_modules is missing
if not exist "d:\ShreeRamFurniture\client\node_modules\" (
    echo [INFO] Frontend node_modules not found. Installing...
    cd /d d:\ShreeRamFurniture\client && npm install
)

echo.
echo ===============================================
echo    SHREE RAM FURNITURE - Starting Servers
echo ===============================================
echo.
echo  [1/2] Starting Backend (Port 5000)...
start "Backend Server" cmd /k "cd /d d:\ShreeRamFurniture\server && echo Starting backend server... && node index.js"
timeout /t 3 /nobreak > nul

echo  [2/2] Starting Frontend (Port 3000)...
start "Frontend Dev" cmd /k "cd /d d:\ShreeRamFurniture\client && echo Starting frontend server... && npm run dev"
timeout /t 4 /nobreak > nul

echo.
echo  ✅ Both servers started!
echo.
echo  Open your browser:
echo  - Public Website:  http://localhost:3000
echo  - Admin Panel:     http://localhost:3000/admin/login
echo  - API Test Page:   file:///d:/ShreeRamFurniture/test-api.html
echo.
echo  Admin Login:
echo  - Email:    admin@shreeramfurniture.com
echo  - Password: Admin@123
echo.
pause
