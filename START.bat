@echo off
echo.
echo  ===============================================
echo     SHREE RAM FURNITURE - Starting Servers
echo  ===============================================
echo.
echo  [1/2] Starting Backend (Port 5000)...
start "Backend Server" cmd /k "cd /d d:\ShreeRamFurniture\server && node index.js"
timeout /t 3 /nobreak > nul
echo  [2/2] Starting Frontend (Port 3000)...
start "Frontend Dev" cmd /k "cd /d d:\ShreeRamFurniture\client && npm run dev"
timeout /t 4 /nobreak > nul
echo.
echo  ✅ Both servers started!
echo.
echo  Open your browser:
echo  - Public Website:  http://localhost:3000
echo  - Admin Panel:     http://localhost:3000/admin/login
echo.
echo  Admin Login:
echo  - Email:    admin@shreeramfurniture.com
echo  - Password: Admin@123
echo.
pause
