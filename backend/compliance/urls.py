from django.urls import path
from .views import get_compliance_reports
from .views import get_compliance_violations
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('reports/', get_compliance_reports, name='compliance-reports'),
    path('violations/', get_compliance_violations, name='compliance-violations'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

