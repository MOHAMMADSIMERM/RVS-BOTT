@echo off
title RAVANAS - Instant Public Web Link
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs

echo ============================================================
echo   👑 Generating Instant Public URL for RAVANAS Dashboard...
echo ============================================================
echo.
echo Make sure your bot/dashboard is already running on port 3000!
echo This will generate a public link (https://...loca.lt) that
echo you and anyone in the world can open on phones or PCs.
echo.

npx localtunnel --port 3000
pause
