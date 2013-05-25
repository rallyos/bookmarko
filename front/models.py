# Importing the django database models 
from django.db import models
# Importing the User class, needed so we can make a relation to it
from django.contrib.auth.models import User


# Bookmark database model fields
class Bookmark(models.Model):
	user = models.ForeignKey(User)
	bookmark_title = models.CharField(max_length=50)
	bookmark_url = models.URLField()
	collection = models.CharField(max_length=30)