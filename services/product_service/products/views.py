from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from rest_framework.views import APIView


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        if self.request.method == 'GET':
            return Product.objects.filter(is_active=True)
        return Product.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != 'VENDOR':
            raise PermissionDenied("Only vendors can add products.")

        serializer.save(vendor_id=user.id)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS:
            if obj.vendor_id != request.user.id:
                raise PermissionDenied("You can only modify your own products.")
class DecrementStockView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            return Response({"detail": "Quantity must be positive."}, status=status.HTTP_400_BAD_REQUEST)
        if product.stock_quantity < quantity:
            return Response({"detail": "Insufficient stock."}, status=status.HTTP_400_BAD_REQUEST)

        product.stock_quantity -= quantity
        product.save()

        return Response({"detail": "Stock updated.", "remaining_stock": product.stock_quantity})   
    from rest_framework.exceptions import PermissionDenied


class AdminProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied("Admin access only.")
        return Product.objects.all().order_by('-created_at')


class AdminProductUpdateView(generics.UpdateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Product.objects.all()

    def patch(self, request, *args, **kwargs):
        if request.user.role != 'ADMIN':
            raise PermissionDenied("Admin access only.")
        product = self.get_object()
        is_active = request.data.get('is_active')
        if is_active is not None:
            product.is_active = is_active
            product.save()
        return Response(ProductSerializer(product).data)         
            