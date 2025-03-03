from django.db import models
from django.contrib.auth.models import User

class EventLog(models.Model):
    timestamp = models.DateTimeField()
    event = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    compliance_status = models.CharField(
        max_length=10,
        choices=[("Compliant", "Compliant"), ("Warning", "Warning"), ("Violation", "Violation")],
        default="Compliant",
    )

    def __str__(self):
        return f"{self.timestamp} - {self.event} (User: {self.user_id}, Status: {self.compliance_status})"
