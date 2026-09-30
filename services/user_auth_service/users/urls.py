from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, ProfileView, CustomLoginView,AddressListCreateView,AddressDeleteView
from .views import  VendorPublicListView
from .views import  AdminUserListView, AdminVendorListView, AdminVendorUpdateView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', AddressDeleteView.as_view(), name='address-delete'),
    path('vendors/', VendorPublicListView.as_view(), name='vendor-public-list'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/vendors/', AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('admin/vendors/<int:pk>/', AdminVendorUpdateView.as_view(), name='admin-vendor-update'),



]