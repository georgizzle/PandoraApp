from django.shortcuts import render
from rest_framework import generics
from .models import Category
from .serializers import CategorySerializer
from .models import Kingdom
from .serializers import KingdomSerializer
from .models import Location
from .serializers import LocationSerializer
from .models import MajorEvent
from .serializers import MajorEventSerializer


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
    queryset = Kingdom.objects.all()
    serializer_class = KingdomSerializer


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
    queryset = MajorEvent.objects.all()
    serializer_class = MajorEventSerializer

def index(request):
    return render(request, 'cosmos/index.html')