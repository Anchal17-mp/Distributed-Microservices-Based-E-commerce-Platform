from django.urls import path, re_path
from .views import GatewayView

urlpatterns = [
    re_path(r'^api/(?P<service>\w+)/(?P<path>.*)$', GatewayView.as_view()),
]