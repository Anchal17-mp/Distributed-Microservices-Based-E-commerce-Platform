from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class SimpleUser:
    def __init__(self, user_id, role, email):
        self.id = user_id
        self.role = role
        self.email = email
        self.is_authenticated = True


class CrossServiceJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        role = validated_token.get('role')
        email = validated_token.get('email')

        if user_id is None or role is None:
            raise InvalidToken('Token missing required claims.')

        return SimpleUser(user_id=user_id, role=role, email=email)