from django.urls import path
from . import views

urlpatterns = [
    path('run_tool_1/', views.run_tool_1, name='run_tool_1'),
    path('run_tool_2/', views.run_tool_2, name='run_tool_2'),
]