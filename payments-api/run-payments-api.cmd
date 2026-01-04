@echo off
setlocal

rem Run payments-api for Cloudflare Tunnel / local dev.
rem Keeps Stripe optional (payments endpoints disabled if missing keys).

cd /d "%~dp0"

rem Load .env (dotenv-style KEY=VALUE lines). Lines starting with # are ignored.
if exist ".env" (
	for /f "usebackq tokens=1* delims==" %%A in (`findstr /v /b "#" ".env"`) do (
		if not "%%A"=="" set "%%A=%%B"
	)
)

set DATABASE_URL=sqlite://payments.db
set BIND_ADDRESS=127.0.0.1:8081
set RUST_LOG=info

rem Write logs next to this script.
set LOG_FILE=%~dp0run.tunnel.log

echo [%DATE% %TIME%] starting payments-api...>> "%LOG_FILE%"
"%~dp0..\target\release\payments-api.exe" >> "%LOG_FILE%" 2>&1

echo [%DATE% %TIME%] payments-api stopped (exit=%ERRORLEVEL%).>> "%LOG_FILE%"

endlocal
