from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^categories$', views.get_categories, name='get_categories'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
