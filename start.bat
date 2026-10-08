@echo off
echo =========================================
echo       STARTING XPIG SERVERS
echo =========================================

echo.
echo [1/2] Starting Python Backend Server (FastAPI)...
start "XPIG Backend" cmd /k "cd /d "%~dp0" && venv\Scripts\activate && python run.py"

echo.
echo [2/2] Starting Next.js Frontend Server...
start "XPIG Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =========================================
echo Servers are starting in separate windows.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo =========================================
exit
