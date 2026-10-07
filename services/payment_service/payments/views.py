import requests
import random
import string
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer

import os
ORDER_SERVICE_URL = os.environ.get("ORDER_SERVICE_URL", "http://127.0.0.1:8003/api/orders")


def generate_transaction_ref():
    return "TXN" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))


class PaymentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'COD')

        if not order_id or not amount:
            return Response({"detail": "order_id and amount are required."}, status=status.HTTP_400_BAD_REQUEST)

        if Payment.objects.filter(order_id=order_id).exists():
            return Response({"detail": "A payment already exists for this order."}, status=status.HTTP_400_BAD_REQUEST)

        # --- SIMULATED payment processing (no real gateway involved) ---
        if payment_method == 'COD':
            payment_status = 'SUCCESS'
            new_order_status = 'CONFIRMED'
        else:
            # Simulate a successful transaction for CARD / UPI / WALLET.
            payment_status = 'SUCCESS'
            new_order_status = 'CONFIRMED'

        payment = Payment.objects.create(
            order_id=order_id,
            customer_id=request.user.id,
            amount=amount,
            payment_method=payment_method,
            status=payment_status,
            transaction_ref=generate_transaction_ref() if payment_status == 'SUCCESS' else None,
        )

        # Update the order's status in Order Service
        auth_header = {"Authorization": request.headers.get("Authorization")}
        try:
            requests.patch(
                f"{ORDER_SERVICE_URL}/{order_id}/update-status/",
                headers=auth_header,
                json={"status": new_order_status},
                timeout=5,
            )
        except requests.exceptions.RequestException:
            pass  # payment is recorded regardless; order status sync is best-effort

        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_id'
    lookup_url_kwarg = 'order_id'

    def get_queryset(self):
        return Payment.objects.filter(customer_id=self.request.user.id)