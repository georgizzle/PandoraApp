from rest_framework import serializers
from .models import Category, Kingdom, Location, MajorEvent
from django.contrib.auth.models import User

default_img='pictures/Erevos_world_map.png'

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


class CategorySerializer(serializers.Serializer):
    id      = serializers.IntegerField(read_only=True)
    name    = serializers.CharField(max_length=30)
    desc    = serializers.CharField(allow_blank=True, allow_null=True)
    cr_date = serializers.DateTimeField()
    img     = serializers.ImageField()


    def create(self, validated_data):
        """
        Create and return a new `Snippet` instance, given the validated data.
        """
        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.title = validated_data.get('name', instance.name)
        instance.code = validated_data.get('desc', instance.desc)
        instance.linenos = validated_data.get('cr_date', instance.cr_date)
        instance.language = validated_data.get('img', instance.img)
        instance.save()
        return instance
