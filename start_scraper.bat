@echo off
echo =========================================
echo    STARTING XPIG AUTOMATED SCRAPER
echo =========================================
echo.
cd /d "%~dp0backend"
venv\Scripts\python run_scraper.py
pause
