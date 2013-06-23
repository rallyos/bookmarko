import json
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from front.models import Bookmark, BookmarkCollection
from front.serializers import BookmarkSerializer, BookmarkCollectionSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

#import urllib2
#from BeautifulSoup import BeautifulSoup



# Index page
# If the user is logged, he should see the user UI. If it's not he will see the index page
def index(request):
	if request.user.is_authenticated():
		return render(request, 'user/index.html')
	else:
		return render(request, 'index.html')

# Register page
def register(request):
	return render(request, 'register/index.html')

# Registration handling function
def register_user(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			form.save()
			return HttpResponseRedirect('register_success')
	return render(request, 'register/index.html')

# Successful registration
def register_success(request):
	return HttpResponse('Registered!!!')

# User UI
def user(request):
	if request.user.is_authenticated():
		return render(request, 'user/index.html')
	else:
		return render(request, 'index.html')


import datetime
from django.utils.timezone import utc

# Login
def login_user(request):
	username = request.GET[ 'username' ]
	password = request.GET[ 'password' ]
	user = authenticate(username=username, password=password)
	if user is not None:
		if user.is_active:
			# Get or Create the token object for the logged user 
			token, created = Token.objects.get_or_create(user=user)

			if not created:
				# update the created time of the token to keep it valid
				token.created = datetime.datetime.utcnow().replace(tzinfo=utc)
				token.save()			

			login(request, user)

			# Create the token cookie
			resp = HttpResponseRedirect('user')
			resp.set_cookie('Token', token)
			return resp
		else:
			return HttpResponse('login failed')
	else:
	# Return an 'invalid login' error message.
		return HttpResponseRedirect('inv')

# Logout
def logout_user(request):
	logout(request)
	return HttpResponseRedirect('/')


# API Class Views
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
