import json
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from front.models import Bookmark, BookmarkCollection, Post, Recover, AppSettings
from front.serializers import BookmarkSerializer, BookmarkCollectionSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
import datetime
from datetime import timedelta
from django.utils.timezone import utc
from google.appengine.api import mail
from django.core.signing import Signer
from django.core.exceptions import ObjectDoesNotExist

# Check if user is logged, otherwise show index page
def index(request):
	if request.user.is_authenticated():
		user_id = request.user.id

		appSettings = AppSettings.objects.get(user_id__exact=user_id)

		bookmarks = Bookmark.objects.filter(user_id__exact=user_id)
		serializedBookmarks = BookmarkSerializer(bookmarks, many=True)

		collection = BookmarkCollection.objects.filter(user_id__exact=user_id)
		serializedBookmarkCollections = BookmarkCollectionSerializer(collection, many=True)

		bootstrapped_data = {'bookmarks': json.dumps(serializedBookmarks.data),
							'BookmarkCollections': json.dumps(serializedBookmarkCollections.data),
							'order_collections': json.dumps(appSettings.order_collections),
							'appearance': json.dumps(appSettings.appearance)}
		return render(request, 'user/index.html', bootstrapped_data)
	else:
		return render(request, 'index.html')
		
def about(request):
	return render(request, 'about.html')

def blog(request):
	posts = Post.objects.all()
	return render(request, 'blog.html', {'posts': posts})

def register_user(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()

			# Login the user
			username = request.POST['username']
			password = request.POST['password1']
			user = authenticate(username=username, password=password)

			# If authenticated 
			if user is not None:
				if user.is_active:
					# Get or Create the token object for the logged user 
					token = set_or_get_token(user)

					# Login and set the token cookie
					login(request, user)
					success = HttpResponse(status=200)

					AppSettings.objects.create(user_id=user.id)

					new_user_time = datetime.datetime.utcnow().replace(tzinfo=utc) + timedelta(seconds=48)
					success.set_cookie('new-user', 'true', expires=new_user_time)
					success.set_cookie('Token', token, expires=365 * 24 * 60 * 60)
					return success

		return HttpResponse(status=403)

def login_user(request):
	if request.method == 'GET':
		username = request.GET[ 'username' ]
		password = request.GET[ 'password' ]
		user = authenticate(username=username, password=password)
	
		# If authenticated 
		if user is not None:
			if user.is_active:
				# Get or Create the token object for the logged user 
				token = set_or_get_token(user)

				# Login and set the token cookie
				login(request, user)
				login_success = HttpResponse(status=200)
				login_success.set_cookie('Token', token, expires=365 * 24 * 60 * 60)
				return login_success
			else:
				# Change this if you delete/deactivate user/user has deleted it's account
				return redirect('/')
		else:
		# Return an 'invalid login' error message.
			return HttpResponse(status=404)

# Create or get a token for the user and return it
def set_or_get_token(user):
	token, created = Token.objects.get_or_create(user=user)

	if not created:
		# update the created time of the token to keep it valid
		token.created = datetime.datetime.utcnow().replace(tzinfo=utc)
		token.save()	
	
	if token.created < datetime.datetime.utcnow().replace(tzinfo=utc) - timedelta(hours=48):
		token.delete()
		token = Token.objects.create(user=user)
		token.created = datetime.datetime.utcnow().replace(tzinfo=utc)
		token.save()	

	return token

def change_settings(request):
	user_settings = AppSettings.objects.get(user_id=request.user.id)
	user_settings.appearance = request.POST['appearance']
	user_settings.order_collections = request.POST['order_collections']
	user_settings.save()
	return HttpResponse(status=200)

def password_change(request):
	if request.method == 'POST':
		user = request.user
		password = request.POST['data']
		user.set_password(password)
		user.save()

		return HttpResponse(status=200)

def forgotten_password(request):
	if request.method == 'POST':
		email = request.POST['username']

		try:
			user = User.objects.get(username=email)
		except ObjectDoesNotExist:
			return HttpResponse('User not found',status=404)

		key = User.objects.make_random_password(length=32)

		mail.send_mail(sender="Bookmarko support <dimitar@bookmarkoapp.com>",
		              to="<"+ email +">",
		              subject="New password requested for Bookmarko",
		              body= """
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
							""" % (email, key) )

		signer = Signer()
		signed_key = signer.sign(key)

		token_key = Recover.objects.create(user_id=user.id, key=signed_key)
		token_key.save()

		return HttpResponse(status=200)

def recover_password(request):
	
	key = request.GET['key']
	
	signer = Signer()
	signed_key = signer.sign(key)
	
	try:
		recover = Recover.objects.get(key=signed_key)
		user = User.objects.get(id=recover.user_id)

		user.backend = 'django.contrib.auth.backends.ModelBackend'
		login(request, user)
		
		recover.delete()

		success = redirect('/')
		
		new_user_time = datetime.datetime.utcnow().replace(tzinfo=utc) + timedelta(seconds=48)
		success.set_cookie('recover', 'true', expires=new_user_time)

		return success

	except ObjectDoesNotExist:
		return HttpResponse('Key already used, or does not exists.',status=404)

def report_bug(request):
	if request.method == 'POST':
		email = request.user.username
		message = request.POST['message']

		mail.send_mail(sender="<"+ email +">",
			              to="Dimitar Ralev <dimitar@bookmarkoapp.com>",
			              subject="User Feedback",
			              body=message)

		return HttpResponse(status=200)

def logout_user(request):
	logout(request)
	return redirect('/')

def add_from_page(request):
	if request.method == 'POST':
		import urllib2
		from bs4 import BeautifulSoup

		url = request.POST['url']
		source = urllib2.urlopen(url)
		BS = BeautifulSoup(source)

		title = BS.title.text
		
		bookmark = Bookmark.objects.create(user_id=request.user.id, title=title, url=url)
		data = {'id': bookmark.pk, 'title': bookmark.title, 'url': bookmark.url}
		return HttpResponse(json.dumps(data) , status=201)

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

"""
from django.views.decorators.csrf import csrf_exempt
import re
import urllib2
from bs4 import BeautifulSoup
from google.appengine.api.images import Image
import urlparse
from urlparse import urljoin
import mimetypes
from google.appengine.api import taskqueue

def dam(request):
	if request.method == 'POST':
		file = request.FILES['thefile']
		test = file.read()

		taskqueue.add(url='/upload',payload=test)
	return HttpResponse(status=200)

def upload_file(test):

		hmm = re.findall(r'href=[\'"]?([^\'" >]+)', str(test), flags=re.IGNORECASE)
		for sait in hmm:

			if sait.endswith('.gif') or sait.endswith('.png') or sait.endswith('.jpeg'):
				Bookmark.objects.create(title=sait, url=sait, image=sait, user_id=1)
			
			else:
				try:
					source = urllib2.urlopen(sait)
					BS = BeautifulSoup(source)

					links = BS.findAll('img', src=True)
					i = 0
				except urllib2.HTTPError, err:
					if err.code == 403:
						pass
		   			else:
						pass
				except urllib2.URLError:
					pass

				for link in links:
					i+= 1
					thelink = urlparse.urljoin(sait, link['src'])
					try:
						imgdata = urllib2.urlopen(thelink)
						img_data = imgdata.open()
						img_type = imgdata.info().getheader('Content-Type')
						
						if img_type == 'image/png' or img_type == 'image/jpeg' or img_type == 'image/gif':
							#therealimage = Image(image_data=img_data)
										
							if img_data.width > 400 and img_data.height > 300:
								url = sait
								title = BS.find('title').text
								Bookmark.objects.create(title=title, url=url, image=thelink, user_id=2)
								img_data.close()
								break
							if i > 1 and img_data.width < 400 and img_data.height < 300:
								url = sait
								title = BS.find('title').text
								Bookmark.objects.create(title=title, url=url, user_id=2)
								break
					except urllib2.HTTPError, err:
						if err.code == 403:
							pass
						else:
							pass
					except urllib2.URLError:
						pass
					except:
						pass

		#file.close()
		return HttpResponse(status=201)
"""