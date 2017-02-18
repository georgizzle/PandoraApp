from django.db import models
from tinymce import models as tinymce_models

# Create your models here.
class Category(models.Model):
    name     = models.CharField(max_length=30)  # The name of the category
    desc     = tinymce_models.HTMLField(null=True) # The description of the category
    cr_date  = models.DateTimeField(auto_now_add=True) # Time and date of creation, defaults to current time
    img      = models.ImageField(upload_to='pictures/category/%Y/%m/%d/') # The link for the image thumbnail

class Location(models.Model):
    name      = models.CharField(max_length=30)
    type      = models.CharField(max_length=30)
    entity    = models.CharField(max_length=30)
    latitude  = models.DecimalField(max_digits=5, decimal_places=2)
    longitude = models.DecimalField(max_digits=5, decimal_places=2)
    altitude  = models.DecimalField(max_digits=10, decimal_places=2)
    final     = models.BooleanField(default=False)

class Kingdom(models.Model):
    name       = models.CharField(max_length=30)  # The name of the category
    desc       = tinymce_models.HTMLField(null=True) # The description of the category
    history    = tinymce_models.HTMLField(null=True)
    geography  = models.ForeignKey(Location, null=True)
    other_info = models.TextField(null=True)
    final      = models.BooleanField(default=False)
    img        = models.ImageField(upload_to='pictures/kingdoms/%Y/%m/%d/')

class MajorEvent(models.Model):
    name      = models.CharField(max_length=30)
    type      = models.CharField(max_length=30)
    desc      = tinymce_models.HTMLField(null=True)
    history   = tinymce_models.HTMLField(null=True)
    kingdom   = models.ForeignKey(Kingdom)
    final     = models.BooleanField(default=False)
    img       = models.ImageField(upload_to='pictures/majorevents/%Y/%m/%d/')