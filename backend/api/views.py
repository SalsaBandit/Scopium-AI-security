from .models import EventLog
from .logging import log_event
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.utils.timezone import now
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json

@api_view(['GET'])
def hello_world(request):
    user = request.user
    if user.is_authenticated:
        return Response({"message": f"Hello, {user.username}!"})
    else:
        return Response({"message": "Hello, Guest!"})

# API endpoint to retrieve all event logs in JSON format.
def get_logs(request):
    logs = EventLog.objects.all().order_by("-timestamp")
    log_data = [
        {
            "event": log.event,
            "timestamp": log.timestamp.isoformat(),
            #"timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": log.user.id if log.user else None,
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
        user_id = data.get("user_id", None)  # Get user_id from the payload
        timestamp = data.get("timestamp", now().isoformat())
        #log_event(event=event)
        user = None
        if user_id:
            try:
                from django.contrib.auth.models import User
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                pass

        # Create a new log entry
        EventLog.objects.create(
            event=event,
            timestamp=timestamp,
            user=user,  # Save the associated user
        )
        return JsonResponse({"status": "success", "message": "Log recorded"})
    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)
'''
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
'''

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            username = request.user.username
            log_event(event=f"User {username} logged out", user=request.user)
            logout(request)
            return JsonResponse({'success': True, 'message': 'You have been logged out successfully'})
        else:
            # If the user is not logged in, return an error
            return JsonResponse({'success': False, 'message': 'User is not logged in'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

# Automatically create a test user on server startup if it doesn't exist
# *****REMOVE BEFORE PRODUCTION*****
def create_test_user():
    if not User.objects.filter(username='USER1').exists():
        User.objects.create_user('USER1', 'test@example.com', 'PW123')

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

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if username == '' and password == '':
            username = 'USER1'
            password = 'PW123'

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            log_event(event=f"User {username} logged in", user=user)
            return JsonResponse({'success': True, 'message': 'Login successful'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def get_current_user(request):
    user = request.user
    return JsonResponse({"id": user.id, "username": user.username})