from rest_framework import serializers
from .models import ComplianceReport

class ComplianceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceReport
        fields = '__all__'

