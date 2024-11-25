import logging
from .models import EventLog
from django.utils import timezone

logger = logging.getLogger(__name__)

def log_event(event="", user=None):
    EventLog.objects.create(
        timestamp=timezone.now(),
        event=event,
        user=user,
    )