@echo off
title PMS 2 - Force Deploy Tool
color 0C
echo ===================================================
echo     PMS 2 - FORCE Deployment Tool (Fixes sync issues)
echo ===================================================
echo.
echo Starting the deployment process...
echo.

echo [1/2] Updating Backend on GitHub (Triggers Render)...
cd backend
git add .
git commit -m "Auto Update / Deployment (Forced)"
git push -f origin HEAD
echo.
echo --- Look above! Did it say "Everything up-to-date" or "error"? ---
echo --- If it says error, let me know! ---
pause
cd ..
echo.

echo [2/2] Updating Frontend on Vercel (Forcing build)...
cd frontend
:: Try to force link just in case
call npx vercel link --yes
call npx vercel --prod --force
echo.
echo --- Look above! Did Vercel output any errors? ---
pause
cd ..

echo ===================================================
echo      DEPLOYMENT COMPLETE! 
echo      (Please wait 3 FULL minutes for Render to boot up)
echo ===================================================
pause
