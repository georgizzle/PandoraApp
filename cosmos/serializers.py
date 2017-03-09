from rest_framework import serializers
from .models import Category, Kingdom, Location, MajorEvent
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


class LocationSerializer(serializers.Serializer):
    id          = serializers.IntegerField(read_only=True)
    type        = serializers.CharField(max_length=30, allow_null=True)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    latitude    = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    longitude   = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    altitude    = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    final       = serializers.BooleanField(default=False)


    def create(self, validated_data):

        return Location.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.type = validated_data.get('type', instance.type)
        instance.description = validated_data.get('description', instance.description)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.altitude = validated_data.get('altitude', instance.altitude)
        instance.final = validated_data.get('final', instance.final)
        instance.save()
        return instance


class KingdomSerializer(serializers.Serializer):
    id          = serializers.IntegerField(read_only=True)
    name        = serializers.CharField(max_length=30)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    history     = serializers.CharField(allow_blank=True, allow_null=True)
    geography   = LocationSerializer(read_only=True)
    other_info  = serializers.CharField(allow_blank=True, allow_null=True)
    img         = serializers.ImageField(allow_null=True,  use_url=False)
    final       = serializers.BooleanField(default=False)


    def create(self, validated_data):

        kingdom = Kingdom.objects.create(**validated_data)
        assign_object_perms('kingdom', self, kingdom)

        return kingdom

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.history = validated_data.get('history', instance.history)
        instance.other_info = validated_data.get('other_info', instance.other_info)
        instance.final = False
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance


class CategorySerializer(serializers.Serializer):
    id          = serializers.IntegerField(read_only=True)
    name        = serializers.CharField(max_length=30)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    cr_date     = serializers.DateTimeField()
    img         = serializers.ImageField(allow_null=True, use_url=False)


    def create(self, validated_data):

        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.cr_date = validated_data.get('cr_date', instance.cr_date)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance


class MajorEventSerializer(serializers.Serializer):
    id          = serializers.IntegerField(read_only=True)
    name        = serializers.CharField(max_length=30)
    type        = serializers.CharField(max_length=30, allow_null=True)
    description = serializers.CharField(allow_blank=True, allow_null=True)
    history     = serializers.CharField(allow_blank=True, allow_null=True)
    kingdom     = KingdomSerializer(read_only=True)
    img         = serializers.ImageField(allow_null=True, use_url=False)
    final       = serializers.BooleanField(default=False)


    def create(self, validated_data):

        major_event = MajorEvent.objects.create(**validated_data)
        assign_object_perms('majorevent', self, major_event)

        return major_event

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.type = validated_data.get('type', instance.type)
        instance.description = validated_data.get('description', instance.description)
        instance.history = validated_data.get('history', instance.history)
        instance.final = validated_data.get('final', instance.final)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance

