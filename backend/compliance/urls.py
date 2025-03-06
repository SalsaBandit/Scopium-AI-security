from django.urls import path
from .views import get_compliance_reports
from .views import get_compliance_violations
from django.conf import settings
from django.conf.urls.static import static
from .views import add_test_compliance_report



urlpatterns = [
    path('reports/', get_compliance_reports, name='compliance-reports'),
    path('violations/', get_compliance_violations, name='compliance-violations'),
    path('add-test-report/', add_test_compliance_report, name='add-test-report'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

