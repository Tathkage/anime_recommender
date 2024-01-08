# myapp/authentication.py
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('auth_token')
        if not token:
            return None
        return self.authenticate_credentials(token)
