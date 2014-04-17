'''Django-rest model serializers'''

from django.contrib.auth.models import User, Group
from rest_framework import serializers
from front.models import Bookmark, BookmarkCollection


class BookmarkCollectionSerializer(serializers.ModelSerializer):

    user_id = serializers.IntegerField(required=False)

    class Meta:
        model = BookmarkCollection
        fields = ('id', 'title', 'background', 'user_id')


class BookmarkSerializer(serializers.ModelSerializer):

    user_id = serializers.IntegerField(required=False)
    collection_id = serializers.IntegerField(required=False)

    class Meta:
        model = Bookmark
        fields = ('id', 'title', 'url', 'description', 'tag',
                'collection_id', 'user_id', 'starred', 'image')
