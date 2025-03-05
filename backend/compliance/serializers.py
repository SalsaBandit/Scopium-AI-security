from rest_framework import serializers
from .models import ComplianceReport
from .models import ComplianceReport, ComplianceViolation

class ComplianceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceReport
        fields = '__all__'

class ComplianceViolationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceViolation
        fields = '__all__'

