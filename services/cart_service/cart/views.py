import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Cart, CartItem

PRODUCT_SERVICE_URL = "http://127.0.0.1:8001/api/products"


def get_or_create_cart(user_id):
    cart, created = Cart.objects.get_or_create(user_id=user_id)
    return cart


def fetch_product(product_id):
    """Calls Product Service directly, server-to-server, to get live product data."""
    try:
        response = requests.get(f"{PRODUCT_SERVICE_URL}/{product_id}/", timeout=5)
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.RequestException:
        return None


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user.id)
        items = cart.items.all()

        enriched_items = []
        subtotal = 0

        for item in items:
            product = fetch_product(item.product_id)
            if product is None:
                continue

            line_total = float(product['price']) * item.quantity
            subtotal += line_total

            enriched_items.append({
                "id": item.id,
                "product_id": item.product_id,
                "name": product['name'],
                "price": product['price'],
                "image": product.get('image'),
                "stock_quantity": product['stock_quantity'],
                "quantity": item.quantity,
                "line_total": line_total,
            })

        return Response({
            "cart_id": cart.id,
            "items": enriched_items,
            "subtotal": subtotal,
            "item_count": len(enriched_items),
        })


class CartItemCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1:
            return Response({"detail": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        product = fetch_product(product_id)
        if product is None:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        if not product['is_active']:
            return Response({"detail": "This product is no longer available."}, status=status.HTTP_400_BAD_REQUEST)
        if product['stock_quantity'] < quantity:
            return Response({"detail": f"Only {product['stock_quantity']} units in stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_or_create_cart(request.user.id)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={"quantity": quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({"detail": "Item added to cart."}, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, item_id):
        cart = get_or_create_cart(request.user.id)
        return CartItem.objects.filter(cart=cart, id=item_id).first()

    def patch(self, request, item_id):
        item = self.get_item(request, item_id)
        if item is None:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', item.quantity))
        if quantity < 1:
            return Response({"detail": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        product = fetch_product(item.product_id)
        if product and product['stock_quantity'] < quantity:
            return Response({"detail": f"Only {product['stock_quantity']} units in stock."}, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save()
        return Response({"detail": "Quantity updated."})

    def delete(self, request, item_id):
        item = self.get_item(request, item_id)
        if item is None:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response({"detail": "Item removed from cart."}, status=status.HTTP_200_OK)


class CartClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user.id)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared."}, status=status.HTTP_200_OK)    
