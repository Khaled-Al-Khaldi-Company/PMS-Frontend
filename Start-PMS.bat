@echo off
title PMS 2 - Starting...
color 0A
echo.
echo =====================================================
echo            PMS 2 - Auto Launch
echo =====================================================
echo.

:: Step 1: Kill old Node processes
echo [1/4] Stopping old Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Step 2: Remove old dist (if unlocked)
echo [2/4] Cleaning dist folder...
if exist "%~dp0backend\dist" (
    rmdir /S /Q "%~dp0backend\dist" >nul 2>&1
)
if exist "%~dp0backend\dist" (
    echo      Warning: dist still locked - continuing anyway
) else (
    echo      dist cleaned.
)

:: Step 3: Start Backend
echo [3/4] Starting Backend on port 4000...
start "PMS Backend" cmd /k "color 0B && echo === PMS Backend === && cd /d "%~dp0backend" && npm run start:dev"

:: Step 4: Wait then start Frontend
echo [4/4] Waiting 12s then starting Frontend on port 3001...
timeout /t 12 /nobreak >nul
start "PMS Frontend" cmd /k "color 0D && echo === PMS Frontend === && cd /d "%~dp0frontend" && npm run dev"

:: Open browser after 10 more seconds
timeout /t 10 /nobreak >nul
start http://localhost:3001

echo.
echo =====================================================
echo   Login: admin@system.com  /  123456
echo =====================================================
echo.
echo Both servers running. Close this window.
exit
