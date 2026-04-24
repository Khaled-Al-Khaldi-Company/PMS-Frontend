@echo off
echo [PMS ERP] FORCING DEPLOYMENT to Khaled-Al-Khaldi-Company account...

:: 1. BACKEND
echo [1/2] Processing Backend...
cd /d d:\OneDrive\المستندات\projects\PMS 2\backend
rd /s /q .git
git init
git add .
git commit -m "Final Backend Production"
git branch -M main
:: This URL forces your PC to ask for the new account's credentials
git remote add origin https://Khaled-Al-Khaldi-Company@github.com/Khaled-Al-Khaldi-Company/PMS-Backend.git
git push -u origin main --force

:: 2. FRONTEND
echo [2/2] Processing Frontend...
cd /d d:\OneDrive\المستندات\projects\PMS 2\frontend
rd /s /q .git
git init
git add .
git commit -m "Final Frontend Production"
git branch -M main
:: This URL forces your PC to ask for the new account's credentials
git remote add origin https://Khaled-Al-Khaldi-Company@github.com/Khaled-Al-Khaldi-Company/PMS-Frontend.git
git push -u origin main --force

echo [SUCCESS] Everything is pushed to your NEW account!
pause
