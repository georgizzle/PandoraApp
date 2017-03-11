from rest_framework import serializers
from .models import Category, Element
from django.contrib.auth.models import User, Group
from guardian.shortcuts import assign_perm

default_img='pictures/Erevos_world_map.png'

moderator_group_name = 'Moderators'


def assign_object_perms(modelname, serializer, instance):

    user = serializer.context['request'].user
    for group in user.groups.all():
        if group.name != moderator_group_name:
            assign_perm('change_{}'.format(modelname), group, instance)
            assign_perm('add_{}'.format(modelname), group, instance)


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('name',)

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True)
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups','is_staff')


# class LocationSerializer(serializers.Serializer):
#     id          = serializers.IntegerField(read_only=True)
#     type        = serializers.CharField(max_length=30, allow_null=True)
#     description = serializers.CharField(allow_blank=True, allow_null=True)
#     latitude    = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
#     longitude   = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
#     altitude    = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
#     final       = serializers.BooleanField(default=False)
#
#
#     def create(self, validated_data):
#
#         return Location.objects.create(**validated_data)
#
#     def update(self, instance, validated_data):
#
#         instance.type = validated_data.get('type', instance.type)
#         instance.description = validated_data.get('description', instance.description)
#         instance.latitude = validated_data.get('latitude', instance.latitude)
#         instance.longitude = validated_data.get('longitude', instance.longitude)
#         instance.altitude = validated_data.get('altitude', instance.altitude)
#         instance.final = validated_data.get('final', instance.final)
#         instance.save()
#         return instance


class ElementSerializer(serializers.Serializer):

    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=30)
    summary = serializers.CharField(allow_blank=True, allow_null=True)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    summary_image = serializers.ImageField(allow_null=True,  use_url=False)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    final = serializers.BooleanField(default=False)

    class Meta:

        lookup_field = 'name__iexact'

    def create(self, validated_data):

        element = Element.objects.create(**validated_data)
        assign_object_perms('element', self, element)

        return element

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.summary = validated_data.get('summary', instance.summary)
        instance.description = validated_data.get('description', instance.description)
        instance.final = False
        instance.category_id = validated_data.get('category', instance.category)
        instance.summary_image = validated_data.get('summary_image', instance.summary_image)
        instance.save()
        return instance


class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=30)
    summary = serializers.CharField(allow_blank=True, allow_null=True)
    template = serializers.CharField(allow_blank=True, allow_null=True)
    cr_date = serializers.DateTimeField()
    summary_image = serializers.ImageField(allow_null=True, use_url=False)

    class Meta:

        lookup_field = 'name__iexact'

    def create(self, validated_data):

        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.summary = validated_data.get('summary', instance.summary)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance

