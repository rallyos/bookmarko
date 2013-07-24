# Importing the django database models 
from django.db import models
# Importing the User class, needed so we can make a relation to it
from django.contrib.auth.models import User


# Collection database model fields
class BookmarkCollection(models.Model):
	title = models.CharField(max_length=50)
	background = models.CharField(max_length=7)
	user = models.ForeignKey(User)

# Bookmark database model fields
class Bookmark(models.Model):
	title = models.CharField(max_length=250)
	url = models.URLField()
	tag = models.CharField(max_length=30, blank=True, null=True)
	collection = models.ForeignKey(BookmarkCollection, blank=True, null=True)
	user = models.ForeignKey(User)
	starred = models.BooleanField()