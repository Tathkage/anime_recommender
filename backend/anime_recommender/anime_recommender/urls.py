"""
URL configuration for anime_recommender project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from anime_recommender.views import (
    runGenreScraper, 
    register_user, 
    create_watchlist, 
    get_watchlists, 
    update_watchlist, 
    delete_watchlist,
    login_user
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/genre-scraper/', runGenreScraper, name='runGenreScraper'),
    path('api/signup/', register_user, name='register_user'),
    path('api/login/', login_user, name='login_user'),
    # Paths for watchlist operations
    path('api/create_watchlist/', create_watchlist, name='create_watchlist'),
    path('api/get_watchlists/', get_watchlists, name='get_watchlists'),
    path('api/update_watchlist/<int:watchlist_id>/', update_watchlist, name='update_watchlist'),
    path('api/delete_watchlist/<int:watchlist_id>/', delete_watchlist, name='delete_watchlist')
]
