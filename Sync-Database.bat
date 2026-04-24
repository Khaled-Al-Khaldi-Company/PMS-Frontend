@echo off
title PMS 2 - Database Sync Tool
color 0A
echo ===================================================
3: echo       Syncing PMS 2 Database with Supabase
echo ===================================================
echo.
echo [1/1] Running Prisma DB Push...
cd backend
call npx prisma db push
echo.
echo Database Sync Complete!
pause
