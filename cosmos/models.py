from django.db import models
from tinymce import models as tinymce_models
import reversion

default_img='pictures/Erevos_world_map.png'
# Create your models here.
class Category(models.Model):
    name     = models.CharField(max_length=30)  # The name of the category
    description = tinymce_models.HTMLField(blank=True, null=True) # The description of the category
    cr_date  = models.DateTimeField(auto_now_add=True) # Time and date of creation, defaults to current time
    img      = models.ImageField(upload_to='pictures/category/%Y/%m/%d/', default=default_img) # The link for the image thumbnail

    def __str__(self):
        return 'Category: ' + self.name

@reversion.register()
class Location(models.Model):
    name      = models.CharField(max_length=30)
    type      = models.CharField(max_length=30, blank=True, null=True) # type of location
    description = tinymce_models.HTMLField(blank=True, null=True) # description - additional info
    latitude  = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    longitude = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    altitude  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    final     = models.BooleanField(default=False)

    def __str__(self):
        ret_str = 'Location: ' + self.name
        return ret_str + ' -- reviewed' if self.final else ret_str + ' -- not reviewed'

@reversion.register()
class Kingdom(models.Model):
    name       = models.CharField(max_length=30)  # The name of the category
    description = tinymce_models.HTMLField(blank=True, null=True) # The description of the category
    history    = tinymce_models.HTMLField(blank=True, null=True)
    geography  = models.ForeignKey(Location, blank=True, null=True)
    other_info = tinymce_models.HTMLField(blank=True, null=True)
    final      = models.BooleanField(default=False)
    img        = models.ImageField(upload_to='pictures/kingdoms/%Y/%m/%d/', default=default_img)


    def __str__(self):
        ret_str = 'Kingdom: ' + self.name
        return ret_str + ' -- reviewed' if self.final else ret_str + ' -- not reviewed'

@reversion.register()
class MajorEvent(models.Model):
    name      = models.CharField(max_length=30)
    type      = models.CharField(max_length=30, null=True)
    description = tinymce_models.HTMLField(null=True)
    history   = tinymce_models.HTMLField(null=True)
    kingdom   = models.ForeignKey(Kingdom)
    final     = models.BooleanField(default=False)
    img       = models.ImageField(upload_to='pictures/majorevents/%Y/%m/%d/', default=default_img)

    def __str__(self):
        ret_str = 'Major Event: ' + self.name
        return ret_str + ' -- reviewed' if self.final else ret_str + ' -- not reviewed'