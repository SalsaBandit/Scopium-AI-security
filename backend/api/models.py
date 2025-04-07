from django.db import models
from django.contrib.auth.models import User

class EventLog(models.Model):
    timestamp = models.DateTimeField()
    event = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
 

    def __str__(self):
        return f"{self.timestamp} - {self.event} (User: {self.user_id}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=50, choices=[("admin", "Admin"), ("user", "User")], default="user")
    access_level = models.IntegerField(default=1)
    password_last_changed = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.user.username}) - {self.role}"


class ComplianceReport(models.Model):
    REPORT_CATEGORIES = [
        ('HIPAA', 'HIPAA'),
        ('Security', 'Security'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report_date = models.DateField()
    category = models.CharField(max_length=100, choices=REPORT_CATEGORIES)
    document = models.FileField(upload_to='documents/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.user.username} on {self.report_date} - {self.category}"

