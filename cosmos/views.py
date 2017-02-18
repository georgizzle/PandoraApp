from django.shortcuts import render
from django.http import JsonResponse
from .mySerializer import MySerialiser
from .models import Category, Kingdom, Location, MajorEvent


def get_categories(request):

    categories = Category.objects.all()

    serializer = MySerialiser()
    data = serializer.serialize(categories)

    return JsonResponse(data, safe=False)


def index(request):
    return render(request, 'cosmos/index.html')