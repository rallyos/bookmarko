# user, and group classes needed for authentication?
from django.contrib.auth.models import User, Group
# Import all serializer classes with 'serializers'
from rest_framework import serializers
# Import models
from front.models import Bookmark, Collection

class BookmarkSerializer(serializers.HyperlinkedModelSerializer):

	# So that we can use it to control single bookmark
	id = serializers.Field()
	
	# So that we can know who is the owner of the bookmarks
  	user_id = serializers.IntegerField()

  	#
  	collection_id = serializers.IntegerField()

  	# Set the model for thi serializer and it's fields
	class Meta:
		model = Bookmark
		fields = ('id', 'bookmark_title', 'bookmark_url', 'collection_id', 'user_id')


class CollectionSerializer(serializers.HyperlinkedModelSerializer):

	# So that we can use it to control single bookmark
	id = serializers.Field()
	
	# So that we can know who is the owner of the bookmarks
  	user_id = serializers.IntegerField()

	class Meta:
		model = Collection
		fields = ('id','collection_name','collection_background','user_id')