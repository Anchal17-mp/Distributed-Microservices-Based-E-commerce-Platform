from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order_id', 'customer_id', 'amount', 'payment_method', 'status', 'transaction_ref', 'created_at']
        read_only_fields = ['id', 'customer_id', 'status', 'transaction_ref', 'created_at']