from django.contrib import admin
from django.urls import path, include
from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls
from .api import api_router # Set up standard Wagtail v2 router

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('admin/', include(wagtailadmin_urls)),
    path('documents/', include(wagtaildocs_urls)),
    
    # Headless API Endpoint
    path('api/v2/', api_router.urls),
    
    # Catch-all for Wagtail page routing
    path('', include(wagtail_urls)),
]
