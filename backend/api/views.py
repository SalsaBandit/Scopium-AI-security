from .models import EventLog, UserProfile
from .logging import log_event
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json

@api_view(['GET'])
def hello_world(request):
    user = request.user
    session_user_id = request.session.get('_auth_user_id')

    if user.is_authenticated:
        return Response({"message": f"Hello, {user.username}!"})
    elif session_user_id:
        try:
            user_obj = User.objects.get(id=session_user_id)
            return Response({"message": f"Hello, {user_obj.username}!"})
        except User.DoesNotExist:
            return Response({"message": "Hello, Guest! (Session User ID exists but not found)"})
    else:
        return Response({"message": f"Hello, Guest! (Session Data: {request.session.items()})"})

# API endpoint to retrieve all event logs in JSON format.
def get_logs(request):
    logs = EventLog.objects.all().order_by("-timestamp")
    log_data = [
        {
            "event": log.event,
            "timestamp": log.timestamp.isoformat(),
            "user_id": log.user.id if log.user else None  # Include user ID if available
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
        username = data.get("user", None)

        user = None
        if request.user.is_authenticated:
            user = request.user
        elif username:
            user = User.objects.filter(username=username).first()

        if event:
            log_event(event=event, user=user)
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

            # Ensure session is properly stored before logging event
            request.session['user_id'] = user.id
            request.session.modified = True
            request.session.save()

            # Log the event only once, ensuring the user is attached
            log_event(event=f"{user.username} logged in", user=user)

            return JsonResponse({'success': True, 'message': 'Login successful'})
        else:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def logout_view(request):
    if request.user.is_authenticated:
        log_event(event=f"{request.user.username} logged out", user=request.user)

    # Perform logout and clear session
    from django.contrib.auth import logout
    logout(request)

    return JsonResponse({'success': True, 'message': 'Logout successful'})

# Automatically create a test user on server startup if it doesn't exist
# Remove before production
def create_test_user():
    user, created = User.objects.get_or_create(
        username='test',
        defaults={
            'email': 'test@example.com',
            'password': make_password('test')
        }
    )

    # Ensure UserProfile exists and has the correct full_name
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            "full_name": "Test User",
            "phone_number": "123-456-7890",
            "role": "admin",
            "access_level": 5
        }
    )

create_test_user()

@api_view(['GET'])
def account_page(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    profile = getattr(user, "profile", None)  # Retrieve UserProfile safely

    boxes = [
        {"title": "Recent Alerts", "content": "A list view with color-coded severity levels (critical, high, moderate)."},
        {"title": "Data Transfer Monitor", "content": "A bar chart showing transfer volumes over time."},
        {"title": "User Activity Monitor", "content": "A line graph showing user activity over time."},
    ]

    return Response({
        "boxes": boxes,
        "username": user.username,
        "email": user.email,
        "account_created": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
        "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login else "Never logged in",
        "full_name": profile.full_name if profile else "N/A",  # Retrieve full name from UserProfile
        "phone_number": profile.phone_number if profile else "N/A",  # Retrieve phone number
        "role": profile.role if profile and profile.role else "N/A",  # Retrieve user role
    })

@api_view(['GET'])
def get_recent_logs(request):
    logs = EventLog.objects.select_related("user").order_by("-timestamp")[:10]
    log_data = [
        {
            "username": log.user.username if log.user else "Unknown",
            "event": log.event,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for log in logs
    ]
    return JsonResponse({"logs": log_data})

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            email = data.get("email", "")
            full_name = data.get("full_name", "")
            phone_number = data.get("phone_number", "")
            role = data.get("role", "user")
            access_level = data.get("access_level", 1)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "message": "Username already exists"}, status=400)

            user = User.objects.create(username=username, email=email, password=make_password(password))
            UserProfile.objects.create(user=user, full_name=full_name, phone_number=phone_number, role=role, access_level=access_level)

            return JsonResponse({"success": True, "message": "User registered successfully"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)

def get_user_details(request, username):
    try:
        user = User.objects.get(username=username)

        # Ensure profile exists
        profile, created = UserProfile.objects.get_or_create(user=user, defaults={
            'full_name': user.username,  # Default name if missing
            'role': 'user',
            'access_level': 1
        })

        return JsonResponse({
            "success": True,
            "username": user.username,
            "role": profile.role,
            "access_level": profile.access_level
        })
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)