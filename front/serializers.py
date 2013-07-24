# user, and group classes needed for authentication?
from django.contrib.auth.models import User, Group
# Import all serializer classes with 'serializers'
from rest_framework import serializers
# Import models
from front.models import Bookmark, BookmarkCollection

class BookmarkCollectionSerializer(serializers.ModelSerializer):

	#id = serializers.Field()
  	user_id = serializers.IntegerField(required=False)

	class Meta:
		model = BookmarkCollection
		fields = ('id','title','background','user_id')

class BookmarkSerializer(serializers.ModelSerializer):

	#id = serializers.Field()
  	user_id = serializers.IntegerField(required=False)
  	#tag = serializers.CharField(required=False)
  	collection_id = serializers.IntegerField(required=False)

  	# Set the model for thi serializer and it's fields
	class Meta:
		model = Bookmark
		fields = ('id', 'title', 'url', 'tag', 'collection_id', 'user_id', 'starred')