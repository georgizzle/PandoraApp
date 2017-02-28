from rest_framework import serializers
from .models import Category, Kingdom, Location, MajorEvent
from django.contrib.auth.models import User

default_img='pictures/Erevos_world_map.png'

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


class LocationSerializer(serializers.Serializer):
    id        = serializers.IntegerField(read_only=True)
    type      = serializers.CharField(max_length=30, allow_null=True)
    desc      = serializers.CharField(allow_blank=True, allow_null=True)
    latitude  = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    longitude = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    altitude  = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    final     = serializers.BooleanField(default=False)


    def create(self, validated_data):

        return Location.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.type = validated_data.get('type', instance.type)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.altitude = validated_data.get('altitude', instance.altitude)
        instance.final = validated_data.get('final', instance.final)
        instance.save()
        return instance


class KingdomSerializer(serializers.Serializer):
    id         = serializers.IntegerField(read_only=True)
    name       = serializers.CharField(max_length=30)
    desc       = serializers.CharField(allow_blank=True, allow_null=True)
    history    = serializers.CharField(allow_blank=True, allow_null=True)
    geography  = LocationSerializer(read_only=True)
    other_info = serializers.CharField(allow_blank=True, allow_null=True)
    img        = serializers.ImageField(allow_null=True)
    final      = serializers.BooleanField(default=False)


    def create(self, validated_data):

        return Kingdom.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.name = validated_data.get('name', instance.name)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.history = validated_data.get('history', instance.history)
        instance.other_info = validated_data.get('other_info', instance.other_info)
        instance.final = validated_data.get('final', instance.final)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance


class CategorySerializer(serializers.Serializer):
    id      = serializers.IntegerField(read_only=True)
    name    = serializers.CharField(max_length=30)
    desc    = serializers.CharField(allow_blank=True, allow_null=True)
    cr_date = serializers.DateTimeField()
    img     = serializers.ImageField(allow_null=True)


    def create(self, validated_data):

        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.cr_date = validated_data.get('cr_date', instance.cr_date)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance


class MajorEventSerializer(serializers.Serializer):
    id         = serializers.IntegerField(read_only=True)
    name       = serializers.CharField(max_length=30)
    type       = serializers.CharField(max_length=30, allow_null=True)
    desc       = serializers.CharField(allow_blank=True, allow_null=True)
    history    = serializers.CharField(allow_blank=True, allow_null=True)
    kingdom    = KingdomSerializer(read_only=True)
    img        = serializers.ImageField(allow_null=True)
    final      = serializers.BooleanField(default=False)


    def create(self, validated_data):

        return Kingdom.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.name = validated_data.get('name', instance.name)
        instance.type = validated_data.get('type', instance.type)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.history = validated_data.get('history', instance.history)
        instance.final = validated_data.get('final', instance.final)
        instance.img = validated_data.get('img', instance.img)
        instance.save()
        return instance

