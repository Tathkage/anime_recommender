from django.contrib import admin
from django.urls import path
from anime_recommender.views import (
    runGenreScraper, 
    register_user, 
    create_watchlist, 
    get_watchlists, 
    update_watchlist, 
    delete_watchlist,
    login_user,
    logout_user,
    add_anime_to_database,
    add_anime_to_watchlist,
    get_or_create_anime,
    add_or_find_anime,
    get_anime_by_watchlist,
    delete_anime_from_watchlist,
    delete_user,
    update_user,
    get_current_user,
    verify_session,
    forgot_password,
    password_reset_confirm,
    change_password,
)

urlpatterns = [
    # Django admin route
    path('admin/', admin.site.urls),

    # User authentication routes
    path('api/signup/', register_user, name='register_user'),
    path('api/login/', login_user, name='login_user'),
    path('api/logout/', logout_user, name='logout_user'),
    path('api/delete-user/', delete_user, name='delete_user'),
    path('api/update-user/', update_user, name='update_user'),
    path('api/get-current-user/', get_current_user, name='get_current_user'),
    path('api/verify-session/', verify_session, name='verify_session'),
    path('api/forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password-confirm/<uidb64>/<token>/', password_reset_confirm, name='password_reset_confirm'),
    path('change-password/<int:user_id>/', change_password, name='change_password'),

    # Watchlist related routes
    path('api/create_watchlist/', create_watchlist, name='create_watchlist'),
    path('api/get_watchlists/', get_watchlists, name='get_watchlists'),
    path('api/update_watchlist/<int:watchlist_id>/', update_watchlist, name='update_watchlist'),
    path('api/delete_watchlist/<int:watchlist_id>/', delete_watchlist, name='delete_watchlist'),

    # Anime specific routes
    path('api/add-anime-to-database/', add_anime_to_database, name='add_anime_to_database'),
    path('api/add-anime-to-watchlist/', add_anime_to_watchlist, name='add_anime_to_watchlist'),
    path('api/get-or-create-anime/', get_or_create_anime, name='get_or_create_anime'),
    path('api/add-or-find-anime/', add_or_find_anime, name='add_or_find_anime'),
    path('api/get-anime-by-watchlist/<int:watchlist_id>/', get_anime_by_watchlist, name='get_anime_by_watchlist'),
    path('api/delete-anime-from-watchlist/<int:anime_id>/<int:watchlist_id>/', delete_anime_from_watchlist, name='delete_anime_from_watchlist'),

    # Miscellaneous routes
    path('api/genre-scraper/', runGenreScraper, name='runGenreScraper'),
]
