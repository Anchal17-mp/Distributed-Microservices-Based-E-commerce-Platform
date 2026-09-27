from rest_framework import serializers
from .models import CustomUser ,Address ,VendorProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'email', 'password',
            'phone', 'gender', 'dob', 'role',
        ]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data['phone'],
            gender=validated_data['gender'],
            dob=validated_data.get('dob'),
            role=validated_data.get('role', 'CUSTOMER'),
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'phone', 'gender', 'dob', 'role',
        ]
        read_only_fields = ['id', 'email', 'role']  

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token


    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        if user.role == 'VENDOR':
            vendor_profile = getattr(user, 'vendor_profile', None)
            if vendor_profile is None or vendor_profile.approval_status != 'APPROVED':
                raise AuthenticationFailed(
                    "Your vendor account is pending admin approval.",
                    code='vendor_not_approved'
                )

        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    business_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    business_description = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'email', 'password',
            'phone', 'gender', 'dob', 'role',
            'business_name', 'business_description',
        ]

    def validate(self, data):
        if data.get('role') == 'VENDOR' and not data.get('business_name'):
            raise serializers.ValidationError(
                {"business_name": "Business name is required for vendor accounts."}
            )
        return data

    def create(self, validated_data):
        business_name = validated_data.pop('business_name', None)
        business_description = validated_data.pop('business_description', '')

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data['phone'],
            gender=validated_data['gender'],
            dob=validated_data.get('dob'),
            role=validated_data.get('role', 'CUSTOMER'),
        )

        if user.role == 'VENDOR':
            VendorProfile.objects.create(
                user=user,
                business_name=business_name,
                business_description=business_description,
            )

        return user
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'is_default', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
class VendorPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['user', 'business_name']        