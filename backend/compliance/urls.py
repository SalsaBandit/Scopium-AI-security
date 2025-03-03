from django.urls import path
from .views import get_compliance_reports

urlpatterns = [
    path('reports/', get_compliance_reports, name='compliance-reports'),
]
