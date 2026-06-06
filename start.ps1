# Splitly A/B Tester - Development Startup Script
Write-Host "Starting Splitly A/B Tester..." -ForegroundColor Cyan

# Install backend deps
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install frontend deps
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Start backend in background
Write-Host "`nStarting backend on http://localhost:3001 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend
Write-Host "Starting frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`nSplitly is starting up!" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "`nBoth windows will open. Close them to stop the servers." -ForegroundColor Gray
