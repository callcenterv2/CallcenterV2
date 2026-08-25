@echo off
setlocal EnableExtensions
title CALL CENTER - SERVER
color 04
cd /d "%~dp0"

echo.
echo    ============================================
echo               C A L L   C E N T E R
echo    ============================================
echo.

rem ------------------------------------------------------------------
rem  read server.conf
rem ------------------------------------------------------------------
set "DOMAIN="
set "PORT=80"
set "EMAIL="

if exist "server.conf" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("server.conf") do (
        if /i "%%A"=="DOMAIN" set "DOMAIN=%%B"
        if /i "%%A"=="PORT"   set "PORT=%%B"
        if /i "%%A"=="EMAIL"  set "EMAIL=%%B"
    )
)
if not defined PORT set "PORT=80"

rem ------------------------------------------------------------------
rem  no web server yet -> fall back, then explain
rem ------------------------------------------------------------------
if not exist "server\caddy.exe" goto :noserver

rem ------------------------------------------------------------------
rem  write the Caddyfile
rem ------------------------------------------------------------------
if defined DOMAIN (set "SITE=%DOMAIN%") else (set "SITE=:%PORT%")

if defined EMAIL (
    > "Caddyfile" echo {
    >>"Caddyfile" echo     email %EMAIL%
    >>"Caddyfile" echo }
    >>"Caddyfile" echo.
    >>"Caddyfile" echo %SITE% {
) else (
    > "Caddyfile" echo %SITE% {
)
>>"Caddyfile" echo     root * .
>>"Caddyfile" echo     encode gzip zstd
>>"Caddyfile" echo.
>>"Caddyfile" echo     route {
>>"Caddyfile" echo         @hidden path /server/* /*.bat /*.md /*.conf /Caddyfile
>>"Caddyfile" echo         respond @hidden 404
>>"Caddyfile" echo         file_server
>>"Caddyfile" echo     }
>>"Caddyfile" echo }

rem ------------------------------------------------------------------
rem  report where the site can be reached
rem ------------------------------------------------------------------
set "LANIP="
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do if not defined LANIP set "LANIP=%%i"
if defined LANIP set "LANIP=%LANIP: =%"

if defined DOMAIN (
    echo    Serving on:   https://%DOMAIN%/
    echo    HTTPS certificate is fetched automatically on first request.
    set "OPENURL=https://%DOMAIN%/"
) else (
    echo    Serving on:   http://localhost:%PORT%/
    if defined LANIP echo                  http://%LANIP%:%PORT%/    ^(same network^)
    echo.
    echo    To publish under a domain, set DOMAIN= in server.conf.
    set "OPENURL=http://localhost:%PORT%/"
)

echo.
echo    Close this window to take the site offline.
echo    ============================================
echo.

if /i not "%~1"=="nobrowser" start "" "%OPENURL%"

server\caddy.exe run --config "Caddyfile" --adapter caddyfile

echo.
echo    The server has stopped.
pause
exit /b

rem ==================================================================
:noserver
echo    The web server is not installed yet.
echo.

where python >nul 2>&1
if errorlevel 1 goto :nopython

echo    Falling back to a simple local preview on port 8080.
echo    Run  installer.bat  to set up real hosting.
echo.
if /i not "%~1"=="nobrowser" start "" "http://localhost:8080/"
python -m http.server 8080
pause
exit /b

:nopython
echo    ==========================================================
echo      Run  installer.bat  first - it downloads the web server.
echo    ==========================================================
echo.
echo    Opening the page locally from disk instead.
echo    (the background film works, but nobody else can reach it)
echo.
start "" "%~dp0index.html"
pause
exit /b
