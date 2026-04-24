@echo off
echo ===================================================
echo             Starting PMS 2 Services
echo ===================================================

echo [1/3] Starting Backend (NestJS)...
start "PMS Backend" cmd /k "cd /d ""%~dp0\backend"" && npm run start:dev"

echo [2/3] Starting Frontend (Next.js)...
start "PMS Frontend" cmd /k "cd /d ""%~dp0\frontend"" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening your browser to the application...
start http://localhost:3001

echo Done! You can close this window.
exit
