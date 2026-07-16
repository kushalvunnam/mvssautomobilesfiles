@echo off
title AutoWorkshop Pro - Public Sharing Tunnel
echo ===================================================
echo   AutoWorkshop Pro - Share with Others (No Time Limit)
echo ===================================================
echo.
echo Connecting to localhost.run tunnel service (port 5173)...
echo Please copy the https://...lhr.life link displayed below.
echo.
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:5173 nokey@localhost.run
echo.
echo Tunnel closed.
pause
