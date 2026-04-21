@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  npm install
)

echo Starting RevAudit...
start /b npm run dev

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

start "" http://localhost:3000
