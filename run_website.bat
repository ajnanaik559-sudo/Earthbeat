@echo off
title EARTHBEAT - NASA Space Apps Challenge 2026
echo ==========================================================
echo          EARTHBEAT -- Hear Our Planet
echo          Team: Stellar Mind X
echo          NASA Space Apps Challenge 2026
echo ==========================================================
echo.
echo Starting local web server...
echo The website will automatically open in your default browser.
echo.
echo URL: http://localhost:8000
echo.
echo Keep this window open while using the website.
echo To stop the server, press Ctrl + C or close this window.
echo ==========================================================
echo.

start "" http://localhost:8000
python -m http.server 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTE] Python is not installed or not in PATH.
    echo Opening index.html directly in your default browser...
    start "" index.html
)
pause
