from .models import EventLog
from django.utils import timezone

def log_event(event=""):
    EventLog.objects.create(
        timestamp=timezone.now(),
        event=event
    )