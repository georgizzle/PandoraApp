from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url, include
from . import views
from rest_framework import routers

# Routers provide an easy way of automatically determining the URL conf.
# from .views import custom404
#
# handler404 = custom404
router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)


urlpatterns = [
    url(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
                      views.password_reset_confirm,
                      name='password_reset_confirm'),
    url(r'^$', views.index, name='index'),
    url(r'^api/categories$', views.CategoryList.as_view()),
    url(r'^api/categories/(?P<name__iexact>.+)/$', views.CategoryDetail.as_view()),
    url(r'^api/allelements/$', views.AllElementsList.as_view()),
    url(r'^api/elements/(?P<category>.+)/(?P<pk>[0-9]+)/$', views.ElementDetail.as_view()),
    url(r'^api/elements/(?P<category>.+)/$', views.ElementList.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^api/rest-auth/', include('rest_auth.urls')),
    url(r'^api/rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^api/currentuser$', views.current_user),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
