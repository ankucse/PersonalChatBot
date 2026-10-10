@echo off
echo ===================================================================
echo   NovaChat AI - Unicorn Enterprise SaaS Launch Script
echo ===================================================================
echo.

start "NovaChat Backend (Spring Boot 8080)" cmd /k "cd /d %~dp0backend && gradlew.bat bootRun"
echo [*] Launching Spring Boot Backend on http://localhost:8080 ...

timeout /t 6 /nobreak >nul

start "NovaChat Frontend (Vite React 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo [*] Launching React SaaS Frontend on http://localhost:5173 ...

echo.
echo Application ready!
echo Open your browser at: http://localhost:5173
echo.
pause
