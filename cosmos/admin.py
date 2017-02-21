from django.contrib import admin
from reversion.admin import VersionAdmin

# Register your models here.
from .models import Category, Kingdom, Location, MajorEvent

@admin.register(Category)
class YourModelAdmin(VersionAdmin):
    pass

@admin.register(Kingdom)
class YourModelAdmin(VersionAdmin):
    pass

@admin.register(Location)
class YourModelAdmin(VersionAdmin):
    pass

@admin.register(MajorEvent)
class YourModelAdmin(VersionAdmin):
    pass