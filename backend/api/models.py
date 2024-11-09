from django.db import models
from django.contrib.auth.models import User

class EventLog(models.Model):
    timestamp = models.DateTimeField()
    event = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.timestamp} - {self.event}"
