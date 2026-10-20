@echo off
title RAVANAS Discord Sovereign Console
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs

echo ============================================================
echo   👑 Starting RAVANAS Discord Bot ^& Web Dashboard...
echo ============================================================
echo.

node src/index.js
pause
