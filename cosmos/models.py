from django.db import models
from tinymce import models as tinymce_models
import reversion

default_img='pictures/Erevos_world_map.png'

@reversion.register()
class Category(models.Model):
    name = models.CharField(max_length=30)  # The name of the category
    summary = tinymce_models.HTMLField(blank=True, null=True) # The description of the category
    template = tinymce_models.HTMLField(blank=True, null=True) # The template of the description
    cr_date = models.DateTimeField(auto_now_add=True) # Time and date of creation, defaults to current time
    related = models.ManyToManyField('self',symmetrical=False, blank=True, through='CategoryRelationship', related_name="related_set")
    summary_image = models.ImageField(upload_to='pictures/' , blank=True) # The link for the image thumbnail

    def __str__(self):
        return 'Category: ' + self.name

class CategoryRelationship(models.Model):
    category1 = models.ForeignKey(Category, related_name="relation_set1")
    category2 = models.ForeignKey(Category, related_name="relation_set2")
    type = models.TextField(blank=True, null=True)

@reversion.register()
class Element(models.Model):
    name = models.CharField(max_length=30)  # The name of the category
    summary = tinymce_models.HTMLField(blank=True, null=True) # The description of the category
    cr_date = models.DateTimeField(auto_now_add=True)
    description = tinymce_models.HTMLField(blank=True, null=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    related = models.ManyToManyField('self', symmetrical=False, blank=True, through='ElementRelationship',
                                     related_name="related_set")
    final = models.BooleanField(default=False)
    summary_image = models.ImageField(upload_to='pictures/', blank=True)


    def __str__(self):
        ret_str = self.category.name + ': ' + self.name
        return ret_str + ' -- reviewed' if self.final else ret_str + ' -- not reviewed'

class ElementRelationship(models.Model):
    element1 = models.ForeignKey(Element, related_name="relation_set1")
    element2 = models.ForeignKey(Element, related_name="relation_set2")
    type = models.TextField(blank=True, null=True)