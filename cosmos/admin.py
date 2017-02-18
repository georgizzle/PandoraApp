from django.contrib import admin

# Register your models here.
from .models import Category, Kingdom, Location, MajorEvent

admin.site.register(Category)
admin.site.register(Kingdom)
admin.site.register(Location)
admin.site.register(MajorEvent)