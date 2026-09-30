import requests
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

SERVICE_MAP = {
    'auth': 'http://127.0.0.1:8000',
    'products': 'http://127.0.0.1:8001',
    'categories': 'http://127.0.0.1:8001',
    'cart': 'http://127.0.0.1:8002',
    'orders': 'http://127.0.0.1:8003',
    'payments': 'http://127.0.0.1:8004',
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