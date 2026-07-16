@echo off
:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with Administrator privileges.
) else (
    echo [ERROR] Please right-click this file and select "Run as Administrator".
    pause
    exit /b
)

echo [INFO] Cleaning up older firewall rules if any...
netsh advfirewall firewall delete rule name="AutoWorkshop Pro Frontend" >nul 2>&1
netsh advfirewall firewall delete rule name="AutoWorkshop Pro Backend" >nul 2>&1

echo [INFO] Creating new rules to allow ports 5173 and 5000 on ALL Wi-Fi networks (Public/Private)...
netsh advfirewall firewall add rule name="AutoWorkshop Pro Frontend" dir=in action=allow protocol=TCP localport=5173 profile=any
netsh advfirewall firewall add rule name="AutoWorkshop Pro Backend" dir=in action=allow protocol=TCP localport=5000 profile=any

echo.
echo ================================================================
echo [SUCCESS] Firewall rules configured successfully!
echo The application is now accessible from other laptops/mobiles
echo on ANY Wi-Fi network you connect to.
echo ================================================================
echo.
pause
