@echo off
title PMS 2 - Auto Deploy Tool
color 0B
echo ===================================================
echo     PMS 2 - Quick Deployment Tool (Vercel / Render)
echo ===================================================
echo.
echo Starting the deployment process...
echo.

echo [1/2] Updating Backend on GitHub (Triggers Render)...
cd backend
git add .
git commit -m "Auto Update / Deployment"
git push origin HEAD
cd ..
echo Backend push successful! (Render will take 1-2 mins to deploy)
echo.

echo [2/2] Updating Frontend on Vercel...
cd frontend
call npx vercel --prod
cd ..
echo Frontend deployment successful!
echo.

echo ===================================================
echo      DEPLOYMENT COMPLETE! 
echo      (Please wait a minute then refresh your page)
echo ===================================================
pause
