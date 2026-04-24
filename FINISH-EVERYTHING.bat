@echo off
echo [PMS ERP] FINAL UNIFIED DEPLOYMENT...
cd /d d:\OneDrive\المستندات\projects\PMS 2
rd /s /q .git
git init
git add .
git commit -m "Complete unified system deployment"
git branch -M main
git remote add origin https://github.com/goodprojectbro/PMS-ERP.git
git push -u origin main --force
echo [SUCCESS] THE ENTIRE SYSTEM IS NOW ON GITHUB!
pause
