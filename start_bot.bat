@echo off
echo =========================================
echo       STARTING XPIG TELEGRAM BOT
echo =========================================
echo.
cd /d "%~dp0backend"
venv\Scripts\python run_bot.py
pause
