from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import RegisterSerializer
from .serializers import AddressSerializer
from .models import Address ,CustomUser
from rest_framework.permissions import IsAuthenticated  

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDeleteView(generics.DestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      user = serializer.save()

      if user.role == 'VENDOR':
        message = "Registration successful. Your vendor account is pending admin approval."
      else:
        message = "Registration successful"

      return Response(
        {
            "message": message,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
            }
        },
        status=status.HTTP_201_CREATED
    )


from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user    
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer  


from .serializers import VendorPublicSerializer,VendorProfile
from rest_framework import permissions


class VendorPublicListView(generics.ListAPIView):
    serializer_class = VendorPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return VendorProfile.objects.filter(approval_status='APPROVED')

from rest_framework.exceptions import PermissionDenied
from .serializers import AdminUserSerializer, AdminVendorSerializer


def require_admin(user):
    if user.role != 'ADMIN':
        raise PermissionDenied("Admin access only.")


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_admin(self.request.user)
        return CustomUser.objects.all().order_by('-created_at')


class AdminVendorListView(generics.ListAPIView):
    serializer_class = AdminVendorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_admin(self.request.user)
        return VendorProfile.objects.all().order_by('-created_at')


class AdminVendorUpdateView(generics.UpdateAPIView):
    serializer_class = AdminVendorSerializer
    permission_classes = [IsAuthenticated]
    queryset = VendorProfile.objects.all()

    def patch(self, request, *args, **kwargs):
        require_admin(request.user)
        vendor = self.get_object()
        new_status = request.data.get('approval_status')
        if new_status not in ['PENDING', 'APPROVED', 'REJECTED']:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        vendor.approval_status = new_status
        vendor.save()
        return Response(AdminVendorSerializer(vendor).data)          