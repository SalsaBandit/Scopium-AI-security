from django.db import models

class ComplianceReport(models.Model):
    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=50,
        choices=[("Passed", "Passed"), ("Pending", "Pending"), ("Failed", "Failed")]
    )
    date = models.DateField()

    def __str__(self):
        return self.title

