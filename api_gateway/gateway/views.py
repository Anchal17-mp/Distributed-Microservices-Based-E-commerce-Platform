import requests
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
import os
SERVICE_MAP = {
    'auth': os.environ.get("AUTH_SERVICE_URL", "http://127.0.0.1:8000"),
    'products': os.environ.get("PRODUCT_SERVICE_URL_BASE", "http://127.0.0.1:8001"),
    'categories': os.environ.get("PRODUCT_SERVICE_URL_BASE", "http://127.0.0.1:8001"),
    'cart': os.environ.get("CART_SERVICE_URL_BASE", "http://127.0.0.1:8002"),
    'orders': os.environ.get("ORDER_SERVICE_URL_BASE", "http://127.0.0.1:8003"),
    'payments': os.environ.get("PAYMENT_SERVICE_URL_BASE", "http://127.0.0.1:8004"),
}


@method_decorator(csrf_exempt, name='dispatch')
class GatewayView(View):
    def dispatch(self, request, service, path=""):
        base_url = SERVICE_MAP.get(service)
        if not base_url:
            return JsonResponse({"detail": f"Unknown service '{service}'."}, status=404)

        target_url = f"{base_url}/api/{service}/{path}"

        headers = {}
        if request.META.get("HTTP_AUTHORIZATION"):
            headers["Authorization"] = request.META["HTTP_AUTHORIZATION"]
        if request.META.get("CONTENT_TYPE"):
            headers["Content-Type"] = request.META["CONTENT_TYPE"]

        try:
            upstream = requests.request(
                method=request.method,
                url=target_url,
                headers=headers,
                params=request.GET.dict(),
                data=request.body,
                timeout=10,
            )
        except requests.exceptions.RequestException:
            return JsonResponse({"detail": f"Could not reach the {service} service."}, status=503)

        return HttpResponse(
            upstream.content,
            status=upstream.status_code,
            content_type=upstream.headers.get("Content-Type", "application/json"),
        )