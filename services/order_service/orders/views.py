from django.shortcuts import render

# Create your views here.
import requests
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer,VendorOrderItemSerializer

import os
PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://127.0.0.1:8001/api/products")
CART_SERVICE_URL = os.environ.get("CART_SERVICE_URL", "http://127.0.0.1:8002/api/cart")


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        shipping_address = request.data.get('shipping_address')
        if not shipping_address:
            return Response({"detail": "shipping_address is required."}, status=status.HTTP_400_BAD_REQUEST)

        auth_header = {"Authorization": request.headers.get("Authorization")}

        # Step 1: get the customer's current cart
        try:
            cart_response = requests.get(f"{CART_SERVICE_URL}/", headers=auth_header, timeout=5)
        except requests.exceptions.RequestException:
            return Response({"detail": "Could not reach Cart Service."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if cart_response.status_code != 200:
            return Response({"detail": "Could not retrieve cart."}, status=status.HTTP_400_BAD_REQUEST)

        cart_data = cart_response.json()
        cart_items = cart_data.get('items', [])

        if not cart_items:
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: validate every item has enough stock BEFORE changing anything
        for item in cart_items:
            try:
                product_response = requests.get(f"{PRODUCT_SERVICE_URL}/{item['product_id']}/", timeout=5)
            except requests.exceptions.RequestException:
                return Response({"detail": "Could not reach Product Service."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            if product_response.status_code != 200:
                return Response({"detail": f"Product {item['product_id']} not found."}, status=status.HTTP_400_BAD_REQUEST)

            product = product_response.json()
            if product['stock_quantity'] < item['quantity']:
                return Response(
                    {"detail": f"Insufficient stock for {product['name']}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Step 3: all validated — now create the order (DB transaction keeps this atomic)
        with transaction.atomic():
            order = Order.objects.create(
                user_id=request.user.id,
                shipping_address=shipping_address,
                total_amount=cart_data['subtotal'],
            )

            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product_id=item['product_id'],
                    product_name=item['name'],
                    price=item['price'],
                    quantity=item['quantity'],
                    vendor_id=item.get('vendor_id', 0),
    
                )

        # Step 4: decrement stock for each item (best-effort, order already exists)
        for item in cart_items:
            try:
                requests.post(
                    f"{PRODUCT_SERVICE_URL}/{item['product_id']}/decrement-stock/",
                    headers=auth_header,
                    json={"quantity": item['quantity']},
                    timeout=5,
                )
            except requests.exceptions.RequestException:
                pass  # order already placed; a failed stock sync here shouldn't undo it

        # Step 5: clear the cart
        try:
            requests.delete(f"{CART_SERVICE_URL}/clear/", headers=auth_header, timeout=5)
        except requests.exceptions.RequestException:
            pass

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user_id=self.request.user.id).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user_id=self.request.user.id)
class OrderUpdateStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]

        if new_status not in valid_statuses:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()

        return Response({"detail": "Order status updated.", "status": order.status})

class VendorOrderItemsView(generics.ListAPIView):
    serializer_class = VendorOrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'VENDOR':
            return OrderItem.objects.none()
        return OrderItem.objects.filter(vendor_id=self.request.user.id).order_by('-order__created_at')        
