from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import UserRegistrationView, MeView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]