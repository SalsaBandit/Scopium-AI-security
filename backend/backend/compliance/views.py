from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ComplianceReport
from .serializers import ComplianceReportSerializer

@api_view(['GET'])
def get_compliance_reports(request):
    reports = ComplianceReport.objects.all()
    serializer = ComplianceReportSerializer(reports, many=True)
    return Response(serializer.data)
