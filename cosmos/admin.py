from django.contrib import admin
from reversion.admin import VersionAdmin

# Register your models here.
from .models import Category, Element

@admin.register(Category)
class YourModelAdmin(VersionAdmin):
    pass

@admin.register(Element)
class YourModelAdmin(VersionAdmin):
    pass
