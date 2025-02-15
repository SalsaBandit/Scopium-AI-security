from .models import EventLog
from django.utils import timezone
from django.contrib.auth.models import User

def log_event(event="", user=None):
    EventLog.objects.create(
        timestamp=timezone.now(),
        event=event,
        user=user
    )