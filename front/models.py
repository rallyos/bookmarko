# Importing the django database models 
from django.db import models
# Importing the User class, needed so we can make a relation to it
from django.contrib.auth.models import User


# Collection database model fields
class Collection(models.Model):
	collection_name = models.CharField(max_length=50)
	collection_background = models.CharField(max_length=7)
	user = models.ForeignKey(User)

# Bookmark database model fields
class Bookmark(models.Model):
	bookmark_title = models.CharField(max_length=50)
	bookmark_url = models.URLField()
	collection = models.ForeignKey(Collection)
	user = models.ForeignKey(User)