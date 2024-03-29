import logging
import os
import sys

# Must set this env var before importing any part of Django
# 'project' is the name of the project created with django-admin.py
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import django.core.handlers.wsgi
import django.core.signals
import django.db
import django.dispatch
sys.path.insert(0, 'libs')

# Force Django to reload its settings.
from django.conf import settings


settings._target = None

def log_exception(*args, **kwds):
    logging.exception('Exception in request:')

signal = django.dispatch.Signal()

# Log errors.
signal.connect(log_exception, django.core.signals.got_request_exception)

# Unregister the rollback event handler.
signal.disconnect(django.db._rollback_on_exception,
                  django.core.signals.got_request_exception)

application = django.core.handlers.wsgi.WSGIHandler()