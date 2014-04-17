'''Defines app models
Bookmark -> BookmarkCollection
Post is used for the blog page.
Recover is used to store temporary key when user is requesting a new password.
AppSettings holds the user app settings:
    Appearance: Grid or List view for the bookmakrs
    Order_Collections: How ot order collections in the sidebar
'''

from django.db import models
from django.contrib.auth.models import User


class BookmarkCollection(models.Model):
    title = models.CharField(max_length=50)
    background = models.CharField(max_length=7)
    user = models.ForeignKey(User)


class Bookmark(models.Model):
    title = models.CharField(max_length=250)
    url = models.URLField(max_length=250)
    description = models.CharField(max_length=250, blank=True, null=True)
    tag = models.CharField(max_length=30, blank=True, null=True)
    collection = models.ForeignKey(BookmarkCollection, blank=True, null=True)
    user = models.ForeignKey(User)
    starred = models.BooleanField()
    image = models.CharField(max_length=400, blank=True, null=True)


class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    date = models.DateField(auto_now=True)


class Recover(models.Model):
    user = models.ForeignKey(User)
    key = models.CharField(max_length=132)


class AppSettings(models.Model):
    user = models.ForeignKey(User)

    NAME = 'NA'
    DATE = 'DA'
    SIZE = 'SI'
    order_collections_choices = (
        (NAME, 'By name'),
        (DATE, 'By date created'),
        (SIZE, 'By size'),
    )
    order_collections = models.CharField(max_length=2, choices=order_collections_choices,
                                        default=NAME)

    GRID = 'GR'
    LIST = 'LI'
    appearance_choices = (
        (GRID, 'Grid'),
        (LIST, 'List'),
    )
    appearance = models.CharField(max_length=2, choices=appearance_choices, default=GRID)
