from rest_framework import serializers
from .models import ComplianceReport

class ComplianceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceReport
        fields = ['id', 'user', 'report_date', 'category', 'document', 'submitted_at']
        read_only_fields = ['id', 'submitted_at']
