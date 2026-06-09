@echo off
title AI Chatbox Launcher
color 0A

echo ========================================================
echo               Starting APEX AI Chatbox                
echo ========================================================
echo.
echo Initializing servers in separate terminal windows...
echo.

echo [1/2] Starting the Python Backend Server on port 8000...
start "APEX Backend Server" cmd /k "cd backend && echo Starting FastAPI Backend... && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting the React Frontend Server...
start "APEX Frontend Server" cmd /k "cd frontend && echo Starting React Frontend... && npm run dev"

echo.
echo ========================================================
echo   Launch Complete! Both servers are starting up.       
echo ========================================================
echo.
echo The frontend terminal will automatically open the app in 
echo your default web browser (usually http://localhost:5173).
echo.
echo Keep the two new terminal windows open to keep the 
echo application running. You can close this window now.
echo.
pause
