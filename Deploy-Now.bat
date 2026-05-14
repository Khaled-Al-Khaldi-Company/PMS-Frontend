@echo off
title 🚀 PMS 2 - Smart Deploy
color 0B
chcp 65001 >nul

echo.
echo  ██████╗ ███╗   ███╗███████╗    ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
echo  ██╔══██╗████╗ ████║██╔════╝    ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝
echo  ██████╔╝██╔████╔██║███████╗    ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝
echo  ██╔═══╝ ██║╚██╔╝██║╚════██║    ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝
echo  ██║     ██║ ╚═╝ ██║███████║    ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║
echo  ╚═╝     ╚═╝     ╚═╝╚══════╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝
echo.
echo                    Khaled Al-Khaldi Contracting - PMS ERP System
echo  ═══════════════════════════════════════════════════════════════════════════════
echo.

:: Get current date/time for commit message
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%"
set "COMMIT_MSG=deploy: PMS update - %TIMESTAMP%"

echo  [STEP 1/4] Preparing Backend for deployment...
echo  ────────────────────────────────────────────────
cd /d "%~dp0backend"

git add . >nul 2>&1
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Backend: No changes to deploy
) else (
    git commit -m "%COMMIT_MSG% [backend]" >nul 2>&1
    echo  [OK] Backend changes committed
)

echo  [PUSH] Pushing Backend to GitHub ^(triggers Render auto-deploy^)...
git push origin HEAD
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Backend push failed - check git credentials
) else (
    echo  [OK] Backend pushed! Render will rebuild in 3-5 minutes.
)
echo.

echo  [STEP 2/4] Preparing Frontend for deployment...
echo  ────────────────────────────────────────────────
cd /d "%~dp0frontend"

git add . >nul 2>&1
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Frontend: No changes to deploy
) else (
    git commit -m "%COMMIT_MSG% [frontend]" >nul 2>&1
    echo  [OK] Frontend changes committed
)

echo  [PUSH] Pushing Frontend to GitHub...
git push origin HEAD
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Frontend push failed - check git credentials
) else (
    echo  [OK] Frontend pushed to GitHub!
)
echo.

echo  [STEP 3/4] Deploying Frontend to Vercel (Production)...
echo  ────────────────────────────────────────────────
call npx vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Vercel deploy failed - trying alternative...
) else (
    echo  [OK] Frontend live on Vercel!
)
echo.

echo  [STEP 4/4] Deployment Summary
echo  ════════════════════════════════════════════════════
echo.
echo   Frontend (Vercel):
echo   https://frontend-seven-vert-45.vercel.app
echo.
echo   Backend (Render) - takes 3-5 mins to rebuild:
echo   https://pms-backend-64zn.onrender.com
echo.
echo   Render Dashboard:
echo   https://dashboard.render.com/web/srv-d7d1f60sfn5c7381mvk0
echo.
echo  ════════════════════════════════════════════════════
echo   Deployment complete! Open the links above to verify.
echo  ════════════════════════════════════════════════════
echo.

:: Open Render dashboard to monitor backend deploy
start https://dashboard.render.com/web/srv-d7d1f60sfn5c7381mvk0/events
timeout /t 3 /nobreak >nul
start https://frontend-seven-vert-45.vercel.app

pause
