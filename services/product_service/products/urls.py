from django.urls import path
from .views import CategoryListView,ProductListCreateView, ProductDetailView,DecrementStockView
from .views import AdminProductListView, AdminProductUpdateView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/decrement-stock/', DecrementStockView.as_view(), name='product-decrement-stock'),
    path('products/admin/', AdminProductListView.as_view(), name='admin-product-list'),
    path('products/admin/<int:pk>/', AdminProductUpdateView.as_view(), name='admin-product-update'),

]