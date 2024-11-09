@echo off
REM Activate the Python virtual environment
call env\Scripts\activate

REM Make Migrations and Start the Django server in a new Command Prompt Window
start cmd /k "cd backend && python manage.py makemigrations && python manage.py migrate && python manage.py runserver"

REM Start the React Development Server in a new Command Prompt Window
start cmd /k "cd frontend && npm start"