@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo Текущая папка: %cd%
echo.
echo Запуск dev сервера...
echo.
call npm run dev
pause
