@echo off
echo [PMS ERP] Final Push to Unified Account...
cd /d d:\OneDrive\المستندات\projects\PMS 2\frontend
:: Clearing any old git settings to start fresh
rd /s /q .git
git init
git add .
git commit -m "Official Production Frontend"
git branch -M main
:: IMPORTANT: This URL matches your terminal account
git remote add origin https://github.com/goodprojectbro/PMS-Frontend-Final.git
git push -u origin main
echo [SUCCESS] Everything is on GitHub!
pause
