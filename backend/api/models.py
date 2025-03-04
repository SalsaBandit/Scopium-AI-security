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

    def __str__(self):
        return f"{self.full_name} ({self.user.username}) - {self.role}"
