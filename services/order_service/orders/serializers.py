from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_id', 'shipping_address', 'total_amount', 'status', 'created_at', 'items']
        read_only_fields = ['id', 'user_id', 'total_amount', 'status', 'created_at']

class VendorOrderItemSerializer(serializers.ModelSerializer):
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_created_at = serializers.DateTimeField(source='order.created_at', read_only=True)
    shipping_address = serializers.CharField(source='order.shipping_address', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'order_status', 'order_created_at', 'shipping_address', 'product_name', 'price', 'quantity']