from django.conf.urls import patterns, url, include
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from front import views

urlpatterns = patterns('',
	url(r'^$', views.index, name='index'),
	url(r'^user', views.user, name='user'),
	url(r'^register_user', views.register_user, name='register'),
	url(r'^register_success', views.register_success, name='success'),
	url(r'^login_user', views.login_user, name='login'),
	url(r'^logout_user', views.logout_user, name='logout'),
	url(r'^api/$', views.BookmarksList.as_view()),
	url(r'^api/(?P<pk>[0-9]+)/$', views.BookmarkDetail.as_view()),
	url(r'^api/collections/$', views.BookmarkCollectionList.as_view()),
	url(r'^api/collections/(?P<pk>[0-9]+)/$', views.BookmarkCollectionDetail.as_view()),
    url(r'^api/auth/', 'rest_framework.authtoken.views.obtain_auth_token'),
    #url(r'^api/obtain/?$', 'views.obtain_expiring_auth_token'),
)

urlpatterns = format_suffix_patterns(urlpatterns)