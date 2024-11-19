from django.urls import path
from . import views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
    path('hello/', views.hello_world, name='hello_world'),
    path("log_event/", views.log_event_view, name="log_event"),
    path("get_logs/", views.get_logs, name="get_logs"),
    path('account/', views.account_page, name='account_page'),
]
