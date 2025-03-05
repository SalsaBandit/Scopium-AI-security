from django.urls import path
from .views import get_compliance_reports
from .views import get_compliance_violations


urlpatterns = [
    path('reports/', get_compliance_reports, name='compliance-reports'),
    path('violations/', get_compliance_violations, name='compliance-violations'),
]
