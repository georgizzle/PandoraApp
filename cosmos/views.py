from django.shortcuts import render
from rest_framework import generics, viewsets
from .models import Category, Element
from .serializers import CategorySerializer, ElementSerializer, AllElementsSerializer
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from reversion.models import Version
from django.db.models.functions import Length
from rest_framework.exceptions import NotFound
from .permissions import IsOwnerOrReadOnly
# #import inflection

from django.http import JsonResponse


def custom404(request):
    return JsonResponse({
        'status_code': 404,
        'error': 'The resource was not found'
    })


moderator_group_name = 'Moderators'



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
    permission_classes = (permissions.DjangoModelPermissionsOrAnonReadOnly,)
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.DjangoModelPermissionsOrAnonReadOnly,)
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'name__iexact'


    def get_object(self):
        self.kwargs['name__iexact'] = self.kwargs['name__iexact'].replace('-', ' ')
        obj = super(CategoryDetail, self).get_object()
        return obj


class AllElementsList(generics.ListCreateAPIView):
    queryset = Element.objects.all().order_by(Length('name').desc())
    serializer_class = AllElementsSerializer


class ElementList(generics.ListCreateAPIView):
    permission_classes = (permissions.DjangoModelPermissionsOrAnonReadOnly,)
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ElementSerializer(queryset, many=True)
        for data in serializer.data:
            if data['final'] is False:
                element = [element for element in queryset if element.id == data['id']][0]
                versions = Version.objects.get_for_object(element)
                if len(versions) > 1:
                    reviewed = [version for version in versions if version.field_dict.get('final')]
                    data['id'] = reviewed[0].field_dict.get('id')
                    data['name'] = reviewed[0].field_dict.get('name')
                    data['summary'] = reviewed[0].field_dict.get('summary')
                    data['description'] = reviewed[0].field_dict.get('description')
                    #print(reviewed[0].field_dict.get('summary_image'))
                    #data['summary_image'] = reviewed[0].field_dict.get('summary_image')
                    data['final'] = reviewed[0].field_dict.get('final')
        return Response(serializer.data)

    def get_queryset(self):
        #if category name is more than one words, it will come in word1-word2 format
        category = self.kwargs['category'].replace('-', ' ')
        if Category.objects.filter(name__iexact=category).exists() == 0:
            raise NotFound('Category wasn\'t found')
        return Element.objects.filter(category__name__iexact=category)

class ElementDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsOwnerOrReadOnly,)
    queryset = Element.objects.all()
    serializer_class = ElementSerializer


    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        serializer_data = serializer.data
        serializer_data['old_version'] = False
        if serializer_data['final'] is False:
            versions = Version.objects.get_for_object(instance)
            if len(versions) > 1:
                reviewed = [version for version in versions if version.field_dict.get('final')]
                serializer_data['id'] = reviewed[0].field_dict.get('id')
                serializer_data['name'] = reviewed[0].field_dict.get('name')
                serializer_data['summary'] = reviewed[0].field_dict.get('summary')
                serializer_data['description'] = reviewed[0].field_dict.get('description')
                #serializer_data['summary_image'] = reviewed[0].field_dict.get('summary_image', 'pictures/kingdoms/2017/03/07/large.jpg')
                serializer_data['final'] = reviewed[0].field_dict.get('final')
                serializer_data['old_version'] = True
        return Response(serializer_data)

    def get_queryset(self):
        #if category name is more than one words, it will come in word1-word2 format
        category = self.kwargs['category'].replace('-', ' ')
        return Element.objects.filter(category__name__iexact=category)

    def get_object(self):
        self.kwargs['category'] = self.kwargs['category'].replace('-', ' ')
        obj = super(ElementDetail, self).get_object()
        return obj

    def get_serializer_context(self):
        return {'request': self.request}

def index(request):
    return render(request, 'cosmos/index.html')

def password_reset_confirm(request):
    return render(request, 'cosmos/password_reset_confirm.html')