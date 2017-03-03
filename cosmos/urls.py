from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url, include
from . import views
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets


# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/categories$', views.CategoryList.as_view()),
    url(r'^api/categories/(?P<pk>[0-9]+)/$', views.CategoryDetail.as_view()),
    url(r'^api/kingdoms$', views.KingdomList.as_view()),
    url(r'^api/kingdoms/(?P<pk>[0-9]+)/$', views.KingdomDetail.as_view()),
    url(r'^api/majorevents$', views.MajorEventList.as_view()),
    url(r'^api/majorevents/(?P<pk>[0-9]+)/$', views.MajorEventDetail.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
