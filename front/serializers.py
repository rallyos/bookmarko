# user, and group classes needed for authentication?
from django.contrib.auth.models import User, Group
# Import all serializer classes with 'serializers'
from rest_framework import serializers
# Import models
from front.models import Bookmark, BookmarkCollection

class BookmarkSerializer(serializers.HyperlinkedModelSerializer):

	# So that we can use it to control single bookmark
	id = serializers.Field()
	
	# So that we can know who is the owner of the bookmarks
  	user_id = serializers.IntegerField(required=False)

  	tags = serializers.CharField(required=False)

  	#
  	collection_id = serializers.IntegerField(required=False)

  	# Set the model for thi serializer and it's fields
	class Meta:
		model = Bookmark
		fields = ('id', 'bookmark_title', 'bookmark_url', 'tags', 'collection_id', 'user_id')


class BookmarkCollectionSerializer(serializers.HyperlinkedModelSerializer):

	# So that we can use it to control single bookmark
	id = serializers.Field()
	
	# So that we can know who is the owner of the bookmarks
  	user_id = serializers.IntegerField(required=False)

	class Meta:
		model = BookmarkCollection
		fields = ('id','collection_name','collection_background','user_id')