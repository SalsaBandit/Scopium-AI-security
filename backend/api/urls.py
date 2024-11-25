from django.urls import path
from api import views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
    path('api/hello/', views.hello_world, name='hello_world'),
    path("api/log_event/", views.log_event_view, name="log_event"),
    path("api/get_logs/", views.get_logs, name="get_logs"),
    path('api/account/', views.account_page, name='account_page'),
    path('api/logout/', views.logout_view, name='logout'),
]
