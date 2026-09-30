from django.urls import path
from .views import OrderCreateView, OrderListView, OrderDetailView,OrderUpdateStatusView
from .views import VendorOrderItemsView

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/update-status/', OrderUpdateStatusView.as_view(), name='order-update-status'),
     path('vendor-items/', VendorOrderItemsView.as_view(), name='vendor-order-items'),


]