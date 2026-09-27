from django.db import models

# Create your models here.
from django.db import models


class Payment(models.Model):
    METHOD_CHOICES = (
        ('CARD', 'Card'),
        ('UPI', 'UPI'),
        ('COD', 'Cash on Delivery'),
        ('WALLET', 'Wallet'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    )

    order_id = models.BigIntegerField(unique=True)
    customer_id = models.BigIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='COD')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for order {self.order_id} - {self.status}"
