'''Defines app views'''

import json
from datetime import timedelta, datetime
from django.utils.timezone import utc
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.core.signing import Signer
from django.core.exceptions import ObjectDoesNotExist
from google.appengine.api import mail
from front.models import Bookmark, BookmarkCollection, Post, Recover, AppSettings
from front.serializers import BookmarkSerializer, BookmarkCollectionSerializer


def index(request):
    ''' Returns user or front templates
    If user is logged in, it grabs its data and returns it with the user template.
    If it's not, it shows him the front page.
    '''

    if request.user.is_authenticated():
        user_id = request.user.id

        appSettings = AppSettings.objects.get(user_id__exact=user_id)

        bookmarks = Bookmark.objects.filter(user_id__exact=user_id)
        serializedBookmarks = BookmarkSerializer(bookmarks, many=True)

        collection = BookmarkCollection.objects.filter(user_id__exact=user_id)
        serializedBookmarkCollections = BookmarkCollectionSerializer(collection, many=True)

        # The user data is returned in this way to ease the app loading.
        bootstrapped_data = {'bookmarks': json.dumps(serializedBookmarks.data),
                            'BookmarkCollections': json.dumps(serializedBookmarkCollections.data),
                            'order_collections': json.dumps(appSettings.order_collections),
                            'appearance': json.dumps(appSettings.appearance)}
        return render(request, 'user/index.html', bootstrapped_data)
    else:
        return render(request, 'index.html')


def about(request):
    '''Returns the about page'''

    return render(request, 'about.html')


def blog(request):
    '''Grabs all blog posts and returns the blog page'''

    posts = Post.objects.all()
    return render(request, 'blog.html', {'posts': posts})


def register_user(request):
    '''Signs new user'''

    if request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            user = form.save()
            username = request.POST['username']
            password = request.POST['password1']
            user = authenticate(username=username, password=password)

            if user is not None:
                if user.is_active:

                    # Get the token needed to access the api
                    token = set_or_get_token(user)

                    # Login user and create settings object
                    login(request, user)
                    AppSettings.objects.create(user_id=user.id)

                    # Set token cookie and new user cookie which expires after 48 seconds
                    success = HttpResponse(status=200)
                    new_user_time = datetime.utcnow().replace(tzinfo=utc) + timedelta(seconds=48)
                    success.set_cookie('new-user', 'true', expires=new_user_time)
                    success.set_cookie('Token', token, expires=365 * 24 * 60 * 60)
                    return success

        return HttpResponse(status=403)


def login_user(request):
    '''Lets the user in'''

    if request.method == 'GET':
        username = request.GET['username']
        password = request.GET['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:

                # Get the token needed to access the api
                token = set_or_get_token(user)

                # Login user and renew token cookie
                login(request, user)
                login_success = HttpResponse(status=200)
                login_success.set_cookie('Token', token, expires=365 * 24 * 60 * 60)
                return login_success
            else:
                # Change this if you delete/deactivate user/user has deleted it's account
                return HttpResponseRedirect('/')
        else:
            return HttpResponse(status=404)


def set_or_get_token(user):
    ''' Checks user token
    Creates new api token if the user doesn't have one, or it's older than 48 hours.
    '''

    token, created = Token.objects.get_or_create(user=user)

    if not created:
        token.created = datetime.utcnow().replace(tzinfo=utc)
        token.save()

    if token.created < datetime.utcnow().replace(tzinfo=utc) - timedelta(hours=48):
        token.delete()
        token = Token.objects.create(user=user)
        token.created = datetime.utcnow().replace(tzinfo=utc)
        token.save()

    return token


def change_settings(request):
    '''Updates user app settings'''

    user_settings = AppSettings.objects.get(user_id=request.user.id)
    user_settings.appearance = request.POST['appearance']
    user_settings.order_collections = request.POST['order_collections']
    user_settings.save()
    return HttpResponse(status=200)


def password_change(request):
    '''Gets the new password that the user sent and saves it'''

    if request.method == 'POST':
        user = request.user
        password = request.POST['data']
        user.set_password(password)
        user.save()
        return HttpResponse(status=200)


def forgotten_password(request):
    ''' Helps the user incase of forgotten password
    Accepts user email and if exists creates random signed key, which is saved with
    the user id to the db and then sends email with instructions to the user.
    '''

    if request.method == 'POST':
        email = request.POST['username']

        try:
            user = User.objects.get(username=email)
        except ObjectDoesNotExist:
            return HttpResponse('User not found', status=404)

        key = User.objects.make_random_password(length=32)

        mail.send_mail(sender="Bookmarko support <dimitar@bookmarkoapp.com>",
        to="<" + email + ">", subject="New password requested for Bookmarko",
        body="""
            Hello %s
            This message is generate atomatically please don't reply. :)
            <a href="http://bookmarkoapp.com/recover?key=%s">Change password</a>
            """ % (email, key), html="""
            Hello %s <br>
            Someone requested password change for your account, if that's you, use the link below.<br>
            <br>
            <a href="http://bookmarkoapp.com/recover?key=%s">Change password</a><br>
            <br>
            This message is generated automatically.
            """ % (email, key))

        signer = Signer()
        signed_key = signer.sign(key)
        token_key = Recover.objects.create(user_id=user.id, key=signed_key)
        token_key.save()

        return HttpResponse(status=200)


def recover_password(request):
    ''' Verifies key
    Accepts the key parameter from the url. If exists in the db it signs the user in
    and prompts him to change his password.
    When the token is used - it's deleted.
    '''

    key = request.GET['key']
    signer = Signer()
    signed_key = signer.sign(key)

    try:
        recover = Recover.objects.get(key=signed_key)
    except ObjectDoesNotExist:
        return HttpResponse('Key already used, or does not exists.', status=404)

    user = User.objects.get(id=recover.user_id)

    # Try to authenticate first so user.backend hack is not needed
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)

    recover.delete()

    success = HttpResponseRedirect('/')
    cookie_time = datetime.utcnow().replace(tzinfo=utc) + timedelta(seconds=48)
    success.set_cookie('recover', 'true', expires=cookie_time)
    return success


def report_bug(request):
    '''Accepts bug report
    Sends bug reports to app email. This function is not used for now because google screwed up.
    (Note: Change the email so it can work again)
    '''

    if request.method == 'POST':
        email = request.user.username
        message = request.POST['message']

        mail.send_mail(sender="<" + email + ">",
        to="Dimitar Ralev <dimitar@bookmarkoapp.com>",
        subject="User Feedback", body=message)
        return HttpResponse(status=200)


def logout_user(request):
    '''Waves to the user for goodbye'''

    logout(request)
    return HttpResponseRedirect('/')


def add_from_page(request):
    ''' Adds bookmark from the app
    Accepts url address, grabs the page title and saves the bookmark.
    '''

    if request.method == 'POST':

        # use urllib and beautifulsoup to make request and fetch the title
        import urllib2
        from bs4 import BeautifulSoup

        url = request.POST['url']
        try:
            source = urllib2.urlopen(url)
        except ValueError:
            source = urllib2.urlopen('http://' + url)

        # Parse the returned html and store title tag text
        BS = BeautifulSoup(source)
        title = BS.title.text

        # Create the new bookmark and return success with the saved bookmark
        # so it can pop in the app too.
        # (To do: return the bookmark object and parse it on the front)
        bookmark = Bookmark.objects.create(user_id=request.user.id, title=title, url=url)
        data = {'id': bookmark.pk, 'title': bookmark.title, 'url': bookmark.url}
        return HttpResponse(json.dumps(data), status=201)

# Django-rest api classes
class BookmarksList(APIView):

    def get(self, request, format=None):
        user_id = request.user.id
        bookmarks = Bookmark.objects.filter(user_id__exact=user_id)
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        current_user = request.user.id
        serializer = BookmarkSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.object.user_id = current_user
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookmarkDetail(APIView):

    def get_object(self, pk):
        try:
            return Bookmark.objects.get(pk=pk)
        except Bookmark.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        bookmark = self.get_object(pk)
        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        bookmark = self.get_object(pk)
        serializer = BookmarkSerializer(bookmark, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        bookmark = self.get_object(pk)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookmarkCollectionList(APIView):

    def get(self, request, format=None):
        user_id = request.user.id
        collection = BookmarkCollection.objects.filter(user_id__exact=user_id)
        serializer = BookmarkCollectionSerializer(collection, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        current_user = request.user.id
        serializer = BookmarkCollectionSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.object.user_id = current_user
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookmarkCollectionDetail(APIView):

    def get_object(self, pk):
        try:
            return BookmarkCollection.objects.get(pk=pk)
        except BookmarkCollection.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user_id = request.user.id
        bookmarks = Bookmark.objects.filter(user_id__exact=user_id, collection_id__exact=pk)
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        collection = self.get_object(pk)
        serializer = BookmarkCollectionSerializer(collection, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        collection = self.get_object(pk)
        collection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
