from django.shortcuts import render
from rest_framework import generics, viewsets
from .models import Category
from .serializers import CategorySerializer
from .models import Kingdom
from .serializers import KingdomSerializer
from .models import Location
from .serializers import LocationSerializer
from .models import MajorEvent
from .serializers import MajorEventSerializer
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions


@api_view(['GET',])
@permission_classes((permissions.AllowAny,))
def current_user(request):

    serializer = None
    if request.user.is_authenticated():
        serializer = UserSerializer(request.user, context={'request': request})

    return Response(serializer.data)

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer



class KingdomList(generics.ListCreateAPIView):
    queryset = Kingdom.objects.all()
    serializer_class = KingdomSerializer


class KingdomDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.DjangoObjectPermissions,)
    queryset = Kingdom.objects.all()
    serializer_class = KingdomSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class LocationList(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class LocationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class MajorEventList(generics.ListCreateAPIView):
    queryset = MajorEvent.objects.all()
    serializer_class = MajorEventSerializer


class MajorEventDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.DjangoObjectPermissions,)
    queryset = MajorEvent.objects.all()
    serializer_class = MajorEventSerializer

def index(request):
    return render(request, 'cosmos/index.html')

def password_reset_confirm(request):
    return render(request, 'cosmos/password_reset_confirm.html')