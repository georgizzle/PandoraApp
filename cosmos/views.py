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
from rest_framework import permissions, status
from reversion.models import Version


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



class KingdomList(generics.ListCreateAPIView):
    queryset = Kingdom.objects.all()
    serializer_class = KingdomSerializer

    def list(self, request):

        queryset = self.get_queryset()
        serializer = KingdomSerializer(queryset, many=True)
        for data in serializer.data:
            if data['final'] is False:
                kingdom = [kingdom for kingdom in queryset if kingdom.id == data['id']][0]
                versions = Version.objects.get_for_object(kingdom)
                if len(versions) > 1:
                    reviewed = [version for version in versions if version.field_dict.get('final')]
                    data['id'] = reviewed[0].field_dict.get('id')
                    data['name'] = reviewed[0].field_dict.get('name')
                    data['description'] = reviewed[0].field_dict.get('description')
                    data['history'] = reviewed[0].field_dict.get('history')
                    data['geography'] = reviewed[0].field_dict.get('geography')
                    data['other_info'] = reviewed[0].field_dict.get('other_info')
                    #data['img'] = reviewed[0].field_dict.get('img', 'pictures/kingdoms/2017/03/07/large.jpg')
                    data['final'] = reviewed[0].field_dict.get('final')
        return Response(serializer.data)

class KingdomDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.DjangoObjectPermissions,)
    queryset = Kingdom.objects.all()
    serializer_class = KingdomSerializer

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
                serializer_data['description'] = reviewed[0].field_dict.get('description')
                serializer_data['history'] = reviewed[0].field_dict.get('history')
                serializer_data['geography'] = reviewed[0].field_dict.get('geography')
                serializer_data['other_info'] = reviewed[0].field_dict.get('other_info')
                # serializer.data['img'] = reviewed[0].field_dict.get('img', 'pictures/kingdoms/2017/03/07/large.jpg')
                serializer_data['final'] = reviewed[0].field_dict.get('final')
                serializer_data['old_version'] = True
        return Response(serializer_data)

    def get_serializer_context(self):
        return {'request': self.request}

class KingdomDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.DjangoObjectPermissions,)
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
    permission_classes = (permissions.DjangoObjectPermissions,)
    queryset = MajorEvent.objects.all()
    serializer_class = MajorEventSerializer

def index(request):
    return render(request, 'cosmos/index.html')

def password_reset_confirm(request):
    return render(request, 'cosmos/password_reset_confirm.html')