from .models import EventLog, UserProfile
from .logging import log_event
from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from .models import ComplianceReport  # make sure this is at the top
from .serializers import ComplianceReportSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import parser_classes, permission_classes

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def submit_compliance_report(request):
    serializer = ComplianceReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({"message": "Compliance report submitted successfully."}, status=201)
    return Response(serializer.errors, status=400)



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

    if not profile_created and not profile.password_last_changed:
        profile.password_last_changed = now()  # Set password last changed if missing
        profile.save()

def create_admin_user():
    user, created = User.objects.get_or_create(
        username='tester',
        defaults={
            'email': 'tester@example.com',
            'password': make_password('tester')
        }
    )

    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            "full_name": "Test Two",
            "phone_number": "555-222-3333",
            "role": "admin",
            "access_level": 5
        }
    )

    if not profile.password_last_changed:
        profile.password_last_changed = now()
        profile.save()

    print("Admin user created:", "Created" if created else "Already exists")

#create_test_user()
#create_admin_user()

@api_view(['GET'])
def account_page(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    profile = getattr(user, "profile", None)  # Retrieve UserProfile safely

     # Get the most recent password change event for the user
    password_change_event = (
        EventLog.objects.filter(user=user, event__icontains="password changed")
        .order_by("-timestamp")
        .first()
    )

    password_last_changed = (
        password_change_event.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        if password_change_event
        else user.date_joined.strftime("%Y-%m-%d %H:%M:%S")
    )

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
        "password_last_changed": password_last_changed, # Retrieve password last changed date
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
        if not request.user.is_authenticated:
            return JsonResponse({"success": False, "message": "Authentication required"}, status=401)

        try:
            creator = request.user
            creator_profile = UserProfile.objects.get(user=creator)

            if creator_profile.role != "admin" or creator_profile.access_level < 5:
                return JsonResponse({"success": False, "message": "Permission denied"}, status=403)

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

            log_event(event=f"User {creator.username} created user {username} (ID: {user.id})", user=creator)

            return JsonResponse({"success": True, "message": "User registered successfully"})
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request"}, status=400)

def get_user_details(request, username):
    try:
        user = User.objects.get(username=username)
        profile = user.profile  # Access UserProfile through related field

        return JsonResponse({
            "success": True,
            "username": user.username,
            "role": profile.role,
            "access_level": profile.access_level,
            "phone_number": profile.phone_number if profile.phone_number else "N/A",
            "full_name": profile.full_name if profile.full_name else "N/A",
            "password_last_changed": profile.password_last_changed.strftime("%Y-%m-%d %H:%M:%S") if profile.password_last_changed else "Unknown"
        })
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    
@csrf_exempt
@api_view(['DELETE'])
def delete_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "message": "Authentication required"}, status=401)

    try:
        admin_user = request.user
        admin_profile = UserProfile.objects.get(user=admin_user)

        if admin_profile.role != "admin" or admin_profile.access_level < 5:
            return JsonResponse({"success": False, "message": "Permission denied"}, status=403)

        data = json.loads(request.body)
        username_to_delete = data.get("username")

        if username_to_delete == admin_user.username:
            return JsonResponse({"success": False, "message": "Admins cannot delete themselves"}, status=400)

        user_to_delete = User.objects.get(username=username_to_delete)
        user_to_delete.delete()

        log_event(event=f"Admin {admin_user.username} deleted user {username_to_delete}", user=admin_user)

        return JsonResponse({"success": True, "message": f"User {username_to_delete} deleted successfully"})

    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
    
@api_view(['GET'])
def list_users(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "message": "Authentication required"}, status=401)

    profile = getattr(request.user, "profile", None)
    if not profile or profile.role != "admin" or profile.access_level < 5:
        return JsonResponse({"success": False, "message": "Permission denied"}, status=403)

    users = User.objects.all().values_list("username", flat=True)
    return JsonResponse({"success": True, "users": list(users)})

from django.http import FileResponse

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_compliance_document(request, report_id):
    try:
        report = ComplianceReport.objects.get(id=report_id)

        # Only allow admins or the user who submitted the report
        if not request.user.is_staff and request.user != report.user:
            return Response({"error": "Unauthorized"}, status=403)

        if not report.document:
            return Response({"error": "No document found"}, status=404)

        file_handle = report.document.open()
        response = FileResponse(file_handle, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{report.document.name.split("/")[-1]}"'
        return response

    except ComplianceReport.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)
