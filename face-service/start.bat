@echo off
echo Starting Face Recognition Service...
echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting FastAPI server...
python app.py

pause
