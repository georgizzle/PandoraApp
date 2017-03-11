from django.shortcuts import render
from rest_framework import generics, viewsets
from .models import Category, Element
from .serializers import CategorySerializer, ElementSerializer
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from reversion.models import Version
import inflection


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
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'name__iexact'


    def get_object(self):
        self.kwargs['name__iexact'] = inflection.pluralize(self.kwargs['name__iexact'].replace('-', ' '))
        obj = super(CategoryDetail, self).get_object()
        return obj


class ElementList(generics.ListCreateAPIView):
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
                    #data['img'] = reviewed[0].field_dict.get('img', 'pictures/kingdoms/2017/03/07/large.jpg')
                    data['final'] = reviewed[0].field_dict.get('final')
        return Response(serializer.data)

    def get_queryset(self):
        #if category name is more than one words, it will come in word1-word2 format
        category = self.kwargs['category'].replace('-', ' ')
        return Element.objects.filter(category__name__iexact=category)

class ElementDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.DjangoObjectPermissions,)
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
                # data['img'] = reviewed[0].field_dict.get('img', 'pictures/kingdoms/2017/03/07/large.jpg')
                serializer_data['old_version'] = True
        return Response(serializer_data)

    def get_object(self):
        self.kwargs['category'] = self.kwargs['category'].replace('-', ' ')
        self.kwargs['name__iexact'] = inflection.pluralize(self.kwargs['name__iexact'].replace('-', ' '))
        print(self.kwargs['name__iexact'])
        obj = super(CategoryDetail, self).get_object()
        return obj

    def get_serializer_context(self):
        return {'request': self.request}

def index(request):
    return render(request, 'cosmos/index.html')

def password_reset_confirm(request):
    return render(request, 'cosmos/password_reset_confirm.html')