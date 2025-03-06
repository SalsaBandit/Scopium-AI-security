from django.db import models

class ComplianceReport(models.Model):
    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=50,
        choices=[("Passed", "Passed"), ("Pending", "Pending"), ("Failed", "Failed")]
    )
    date = models.DateField()
    document = models.FileField(upload_to='compliance_documents/', blank=True, null=True)

    def __str__(self):
        return self.title


class ComplianceViolation(models.Model):
    report = models.ForeignKey(ComplianceReport, on_delete=models.CASCADE)
    user = models.CharField(max_length=255)
    violation_type = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.violation_type} - {self.user}"
