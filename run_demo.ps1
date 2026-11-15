# Axiom: One-Click Startup Script for Windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AXIOM — Token-Budgeted Autonomous Coding Agent Engine   " -ForegroundColor Green
Write-Host "  Global AI Hackathon 2026 | Elimination Round Submission " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in background
Write-Host "`n[1/3] Starting Axiom FastAPI Backend on port 8000..." -ForegroundColor Green
$BackendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir'; $env:PYTHONPATH='backend'; .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Start-Sleep -Seconds 3

# 2. Start Frontend
Write-Host "[2/3] Starting React Vite Dashboard on port 5173..." -ForegroundColor Green
$FrontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$CurrentDir\frontend'; npm run dev" -PassThru

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "[3/3] Opening Axiom Live Engineering Arena in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n>>> Axiom is live and running!" -ForegroundColor Cyan
Write-Host "Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor Gray
Write-Host "Frontend UI:  http://localhost:5173" -ForegroundColor Gray
Write-Host "Slide Deck:   http://localhost:5173/pitch_deck/presentation.html" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C or close the spawned windows to stop the servers." -ForegroundColor Yellow

