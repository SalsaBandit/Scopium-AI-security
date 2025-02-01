from .models import EventLog
from .logging import log_event
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello, world!"})

# API endpoint to retrieve all event logs in JSON format.
def get_logs(request):
    logs = EventLog.objects.all().order_by("-timestamp")
    log_data = [
        {
            "event": log.event,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]
    return JsonResponse({"logs": log_data})

# API endpoint to log an event; temporarily exempted from CSRF for development.
@csrf_exempt # This is temporary and eventually we will want CSRF tokens for security.
def log_event_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        event = data.get("event", "")
        log_event(event=event)
        return JsonResponse({"status": "success", "message": "Log recorded"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'message': 'Login successful'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

# Automatically create a test user on server startup if it doesn't exist
# Remove before production
def create_test_user():
    if not User.objects.filter(username='test').exists():
        User.objects.create_user('test', 'test@example.com', 'test')

create_test_user()

@api_view(['GET'])
def account_page(request):
    # Example data for the "Account" page
    boxes = [
        {"title": "Recent Alerts", "content": "A list view with color-coded severity levels (critical, high, moderate)."},
        {"title": "Data Transfer Monitor", "content": "A bar chart showing transfer volumes over time."},
        {"title": "Recent Logs", "content": "A list view of recent logs with details."},
        {"title": "User Activity Monitor", "content": "A line graph showing user activity over time."},
    ]
    return Response({"boxes": boxes})

