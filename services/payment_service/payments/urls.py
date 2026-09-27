from django.urls import path
from .views import PaymentCreateView, PaymentDetailView

urlpatterns = [
    path('create/', PaymentCreateView.as_view(), name='payment-create'),
    path('<int:order_id>/', PaymentDetailView.as_view(), name='payment-detail'),
]