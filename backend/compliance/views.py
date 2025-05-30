from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ComplianceReport
from .serializers import ComplianceReportSerializer, ComplianceViolationSerializer
from .models import ComplianceReport, ComplianceViolation


@api_view(['GET', 'POST'])
def get_compliance_reports(request):
    if request.method == 'GET':
        reports = ComplianceReport.objects.all()
        serializer = ComplianceReportSerializer(reports, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ComplianceReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_compliance_violations(request):
    violations = ComplianceViolation.objects.all()
    serializer = ComplianceViolationSerializer(violations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def add_test_compliance_report(request):
    ComplianceReport.objects.create(
        title="HIPAA Compliance Audit",
        status="Passed",
        date="2025-03-06"
    )
    return Response({"message": "Test report added!"})


