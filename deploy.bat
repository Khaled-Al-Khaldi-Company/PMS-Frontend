@echo off
chcp 65001 >nul
echo ==========================================
echo جاري رفع التعديلات لتحديث الموقع...
echo ==========================================
echo.

git add .
git commit -m "fix: update missing imports and deploy"
git push -u origin HEAD

echo.
echo ==========================================
echo تم رفع التعديلات بنجاح! 
echo ستقوم منصة Vercel الآن بتحديث الموقع تلقائياً.
echo يمكنك إغلاق هذه النافذة.
echo ==========================================
pause
