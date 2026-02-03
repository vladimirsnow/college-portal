#!/usr/bin/env pwsh
# Скрипт для запуска dev сервера в PowerShell

Write-Host "Запуск dev сервера college-portal..." -ForegroundColor Green
Write-Host ""

# Переходим в папку скрипта
Set-Location $PSScriptRoot

Write-Host "Текущая папка: $((Get-Location).Path)" -ForegroundColor Cyan
Write-Host ""

# Запускаем сервер
Write-Host "Установленные модули проверяются..." -ForegroundColor Yellow
npm run dev

Write-Host ""
Write-Host "Сервер остановлен" -ForegroundColor Red
Read-Host "Нажмите Enter для выхода"
