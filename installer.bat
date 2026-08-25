@echo off
setlocal EnableExtensions EnableDelayedExpansion
title CALL CENTER - FULL SETUP
color 04
cd /d "%~dp0"

echo.
echo    ============================================
echo               C A L L   C E N T E R
echo             F U L L   O N E - C L I C K
echo    ============================================
echo.

rem ------------------------------------------------------------------
rem  0.  administrator rights  (self-elevate)
rem ------------------------------------------------------------------
net session >nul 2>&1
if errorlevel 1 (
    echo    Getting administrator rights - confirm the Windows prompt...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" >nul 2>&1
    exit /b
)
echo    Running as administrator - good.
echo.

rem ------------------------------------------------------------------
rem  1.  web server  (Caddy)
rem ------------------------------------------------------------------
if not exist "server" mkdir "server"
echo    [1/6]  Web server
if exist "server\caddy.exe" (
    echo           already installed
) else (
    echo           downloading Caddy...
    curl.exe -L --fail --silent --show-error -o "server\caddy.exe" "https://caddyserver.com/api/download?os=windows&arch=amd64"
    if not exist "server\caddy.exe" (
        echo           curl failed - trying PowerShell...
        powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'https://caddyserver.com/api/download?os=windows^&arch=amd64' -OutFile 'server\caddy.exe' -UseBasicParsing } catch { exit 1 }"
    )
)
if not exist "server\caddy.exe" (
    echo.
    echo    ERROR: web server download failed. Check the internet and retry.
    pause & exit /b 1
)
set "CADDYVER="
for /f "delims=" %%v in ('server\caddy.exe version 2^>nul') do if not defined CADDYVER set "CADDYVER=%%v"
if defined CADDYVER (echo           OK - !CADDYVER!) else (echo           WARNING: caddy.exe will not run & pause & exit /b 1)

rem ------------------------------------------------------------------
rem  2.  firewall  -  allow 80/443 + caddy, and REMOVE blocking rules
rem ------------------------------------------------------------------
echo    [2/6]  Windows firewall
for %%R in ("CALL CENTER HTTP" "CALL CENTER HTTPS" "CALL CENTER HTTP OUT" "CALL CENTER HTTPS OUT" "CALL CENTER CADDY") do (
    netsh advfirewall firewall delete rule name=%%R >nul 2>&1
)
netsh advfirewall firewall add rule name="CALL CENTER HTTP"      dir=in  action=allow protocol=TCP localport=80  profile=any >nul 2>&1
netsh advfirewall firewall add rule name="CALL CENTER HTTPS"     dir=in  action=allow protocol=TCP localport=443 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="CALL CENTER HTTP OUT"  dir=out action=allow protocol=TCP localport=80  profile=any >nul 2>&1
netsh advfirewall firewall add rule name="CALL CENTER HTTPS OUT" dir=out action=allow protocol=TCP localport=443 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="CALL CENTER CADDY"     dir=in  action=allow program="%~dp0server\caddy.exe" enable=yes profile=any >nul 2>&1
echo           allow rules for 80 + 443 set
echo           checking for conflicting BLOCK rules...
powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand JABwAG8AcgB0AHMAIAA9ACAAQAAoACcAOAAwACcALAAnADQANAAzACcAKQAKACQAYwBoAGEAbgBnAGUAZAAgAD0AIAAkAGYAYQBsAHMAZQAKAEcAZQB0AC0ATgBlAHQARgBpAHIAZQB3AGEAbABsAFIAdQBsAGUAIAAtAEQAaQByAGUAYwB0AGkAbwBuACAASQBuAGIAbwB1AG4AZAAgAC0AQQBjAHQAaQBvAG4AIABCAGwAbwBjAGsAIAAtAEUAbgBhAGIAbABlAGQAIABUAHIAdQBlACAALQBFAHIAcgBvAHIAQQBjAHQAaQBvAG4AIABTAGkAbABlAG4AdABsAHkAQwBvAG4AdABpAG4AdQBlACAAfAAgAEYAbwByAEUAYQBjAGgALQBPAGIAagBlAGMAdAAgAHsACgAgACAAJAByACAAPQAgACQAXwAKACAAIAAkAHAAZgAgAD0AIAAkAHIAIAB8ACAARwBlAHQALQBOAGUAdABGAGkAcgBlAHcAYQBsAGwAUABvAHIAdABGAGkAbAB0AGUAcgAgAC0ARQByAHIAbwByAEEAYwB0AGkAbwBuACAAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQAKACAAIABpAGYAIAAoACQAcABmACAALQBhAG4AZAAgACgAKAAkAHAAZgAuAFAAcgBvAHQAbwBjAG8AbAAgAC0AZQBxACAAJwBUAEMAUAAnACkAIAAtAG8AcgAgACgAJABwAGYALgBQAHIAbwB0AG8AYwBvAGwAIAAtAGUAcQAgACcAQQBuAHkAJwApACkAKQAgAHsACgAgACAAIAAgACQAbABwACAAPQAgAEAAKAAkAHAAZgAuAEwAbwBjAGEAbABQAG8AcgB0ACkACgAgACAAIAAgAGkAZgAgACgAJABsAHAAIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAAJABwAG8AcgB0AHMAIAAtAGMAbwBuAHQAYQBpAG4AcwAgACQAXwAgAH0AKQAgAHsACgAgACAAIAAgACAAIAB0AHIAeQAgAHsAIABEAGkAcwBhAGIAbABlAC0ATgBlAHQARgBpAHIAZQB3AGEAbABsAFIAdQBsAGUAIAAtAE4AYQBtAGUAIAAkAHIALgBOAGEAbQBlACAALQBFAHIAcgBvAHIAQQBjAHQAaQBvAG4AIABTAHQAbwBwADsAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAKAAnACAAIAAgAGQAaQBzAGEAYgBsAGUAZAAgAGIAbABvAGMAawAgAHIAdQBsAGUAOgAgACcAIAArACAAJAByAC4ARABpAHMAcABsAGEAeQBOAGEAbQBlACkAOwAgACQAYwBoAGEAbgBnAGUAZAAgAD0AIAAkAHQAcgB1AGUAIAB9ACAAYwBhAHQAYwBoACAAewB9AAoAIAAgACAAIAB9AAoAIAAgAH0ACgB9AAoAaQBmACAAKAAtAG4AbwB0ACAAJABjAGgAYQBuAGcAZQBkACkAIAB7ACAAVwByAGkAdABlAC0ASABvAHMAdAAgACcAIAAgACAAbgBvACAAYwBvAG4AZgBsAGkAYwB0AGkAbgBnACAAYgBsAG8AYwBrACAAcgB1AGwAZQBzACAAbwBuACAAOAAwAC8ANAA0ADMAJwAgAH0ACgA=

rem ------------------------------------------------------------------
rem  3.  configuration
rem ------------------------------------------------------------------
echo    [3/6]  Configuration
if exist "server.conf" (
    echo           server.conf already exists - left untouched
) else (
    > "server.conf" echo # ==========================================================
    >>"server.conf" echo #  CALL CENTER - server settings   ^(no spaces around "="^)
    >>"server.conf" echo # ==========================================================
    >>"server.conf" echo.
    >>"server.conf" echo # Your domain. Leave EMPTY to serve plain HTTP only.
    >>"server.conf" echo # With a domain set, Caddy fetches a free HTTPS certificate.
    >>"server.conf" echo DOMAIN=
    >>"server.conf" echo.
    >>"server.conf" echo # Port used when no domain is set.
    >>"server.conf" echo PORT=80
    >>"server.conf" echo.
    >>"server.conf" echo # Optional: address for certificate expiry warnings.
    >>"server.conf" echo EMAIL=
    echo           server.conf created
)

rem ------------------------------------------------------------------
rem  4.  network diagnosis  -  local IP vs public IP  (NAT check)
rem ------------------------------------------------------------------
echo    [4/6]  Network diagnosis
set "LANIP="
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do if not defined LANIP set "LANIP=%%i"
if defined LANIP set "LANIP=!LANIP: =!"
set "PUBIP="
for /f "delims=" %%i in ('curl.exe -s -m 10 https://api.ipify.org 2^>nul') do if not defined PUBIP set "PUBIP=%%i"
if not defined PUBIP for /f "delims=" %%i in ('curl.exe -s -m 10 https://ifconfig.me/ip 2^>nul') do if not defined PUBIP set "PUBIP=%%i"
echo           local IPv4 : !LANIP!
if defined PUBIP (echo           public IP  : !PUBIP!) else (echo           public IP  : ^(not detected^))
set "NAT=unknown"
if defined PUBIP if defined LANIP ( if "!LANIP!"=="!PUBIP!" (set "NAT=no") else (set "NAT=yes") )

rem ------------------------------------------------------------------
rem  5.  autostart on boot
rem ------------------------------------------------------------------
echo    [5/6]  Autostart on boot
schtasks /create /tn "CALL CENTER" /tr "\"%~dp0start.bat\" nobrowser" /sc onstart /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (echo           could not register - start manually) else (echo           registered - runs at every boot)

rem ------------------------------------------------------------------
rem  6.  verdict
rem ------------------------------------------------------------------
echo    [6/6]  Result
echo.
echo    ============================================
echo                  D I A G N O S I S
echo    ============================================
if "!NAT!"=="yes" (
    echo    This server is BEHIND the provider network ^(NAT^):
    echo        local  !LANIP!
    echo        public !PUBIP!
    echo.
    echo    ^>^> You MUST forward TCP 80 and 443 from the public IP
    echo       to this server in the HOST CONTROL PANEL
    echo       ^(Port Forwarding / L4 rules / Firewall^).
    echo       No script can open the provider's edge - that part
    echo       is done in the panel or by a support ticket.
) else (
    echo    Windows-side setup is COMPLETE - server holds its own IP.
    echo.
    echo    If it is still unreachable from OTHER networks, the
    echo    host's edge / DDoS firewall is filtering the ports.
    echo    Open TCP 80 and 443 ^(inbound^) in the HOST CONTROL PANEL.
)
echo    ============================================
echo.
echo    Starting the server now...
echo    ^(close this window to take the site offline^)
echo.
timeout /t 2 /nobreak >nul
call "%~dp0start.bat" nobrowser
exit /b
