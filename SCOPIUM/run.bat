@echo off
REM Activate the Python virtual environment
call env\Scripts\activate

REM Start the Django server in a new Command Prompt window
start cmd /k "cd backend && python manage.py runserver"

REM Start the React development server in a new Command Prompt window
start cmd /k "cd frontend && npm start"