from django.contrib import admin
from .models import CustomUser, VendorProfile


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'business_name', 'user', 'approval_status', 'created_at']
    list_filter = ['approval_status']
    search_fields = ['business_name', 'user__email']
    list_editable = ['approval_status']