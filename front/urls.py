from django.conf.urls import patterns, url
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from front import views

urlpatterns = patterns('',
	url(r'^$', views.index, name='index'),
	url(r'^about', views.about, name='about'),
	url(r'^blog', views.blog, name='blog'),
	url(r'^collections/[0-9]', views.index, name='index'),
	url(r'^register_user', views.register_user, name='register'),
	url(r'^login_user', views.login_user, name='login'),
	url(r'^logout_user', views.logout_user, name='logout'),
	url(r'^password_change', views.password_change),
	url(r'^forgotten_password', views.forgotten_password),
	url(r'^change_settings', views.change_settings),
	url(r'^report_bug', views.report_bug),
	url(r'^recover', views.recover_password, ),
	url(r'^add_from_page', views.add_from_page, ),
	url(r'^api/$', views.BookmarksList.as_view()),
	url(r'^api/(?P<pk>[0-9]+)$', views.BookmarkDetail.as_view()),
	url(r'^api/collections/$', views.BookmarkCollectionList.as_view()),
	url(r'^api/collections/(?P<pk>[0-9]+)$', views.BookmarkCollectionDetail.as_view()),
    url(r'^api/auth/', 'rest_framework.authtoken.views.obtain_auth_token'),
	#url(r'^upload', views.upload_file, name='upload'),
	#url(r'^da', views.dam, name='dam')
)

urlpatterns = format_suffix_patterns(urlpatterns)