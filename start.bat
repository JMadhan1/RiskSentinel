@echo off
echo Starting RiskSentinel - All Services
echo =====================================

REM Get the directory of this script
set ROOT=%~dp0
set BACKEND=%ROOT%backend

REM Terminal 1: Lit Protocol Service (port 3001)
start "Lit Protocol Service" cmd /k "cd /d %BACKEND%\lit_service && node index.js"

REM Small delay to let Lit start
timeout /t 2 /nobreak >nul

REM Terminal 2: Storacha Service (port 3002)
start "Storacha Service" cmd /k "cd /d %BACKEND%\storacha_service && node index.js"

REM Small delay
timeout /t 2 /nobreak >nul

REM Terminal 3: FastAPI Backend (port 8000)
start "FastAPI Backend" cmd /k "cd /d %BACKEND% && set PYTHONPATH=. && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Small delay
timeout /t 3 /nobreak >nul

REM Terminal 4: React Frontend (port 5173)
start "React Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo All 4 services started in separate windows!
echo.
echo  Lit Protocol:  http://localhost:3001/health
echo  Storacha:      http://localhost:3002/health
echo  Backend API:   http://localhost:8000/docs
echo  Frontend:      http://localhost:5173
echo.
echo Press any key to trigger a manual scan...
pause >nul
curl -s -X POST http://localhost:8000/api/scan
echo.
echo Scan triggered! Check http://localhost:5173
pause
