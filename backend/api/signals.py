from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(pre_save, sender=User)
def update_password_change_timestamp(sender, instance, **kwargs):
    if instance.pk:
        old_user = User.objects.get(pk=instance.pk)
        if old_user.password != instance.password:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            profile.password_last_changed = timezone.now()
            profile.save()