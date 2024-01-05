# Standard library imports
import json

# Django imports
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from django.http import JsonResponse
from django.core.exceptions import ValidationError

# Django Rest Framework imports
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

# Third-party imports
import mysql.connector
from decouple import config
import logging

# Local application imports
import anime_recommender.scraper.scraper as scraper
from .models import Anime, Watchlist, AnimeWatchlist  # Adjust the import path based on your project structure

logger = logging.getLogger(__name__)


#######################
# Database Connection #
#######################
def create_db_connection():
    try:
        return mysql.connector.connect(
            host=config('DB_HOST'),
            database=config('DB_NAME'),
            user=config('DB_USER'),
            password=config('DB_PASSWORD'),
            port=config('DB_PORT', cast=int)
        )
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
        

################
# Web Scrapers #
################

async def runGenreScraper(request):
    genreNames = request.GET.getlist('genres')

    if not genreNames:
        return JsonResponse({"Anime Info": []})
    
    genreUrls = await scraper.filterGenreUrls(genreNames)
    
    data = []
    for genre, urlSuffix in genreUrls.items():
        genreData = await scraper.genreScraper(genre, urlSuffix)
        for anime in genreData["Anime Info"]:
            existingEntry = next((item for item in data if item["Title"] == anime["Title"]), None)
            if existingEntry:
                existingEntry["Genre"].extend(anime["Genre"])
            else:
                data.append(anime)
    
    filteredData = [anime for anime in data if set(genreNames).issubset(set(anime["Genre"]))]
    sortedData = sorted(filteredData, key=ratingSorter, reverse=True)
    
    return JsonResponse({"Anime Info": sortedData}, safe=False)

def ratingSorter(anime):
    rating = anime.get("Rating")
    return float(rating) if rating and rating != "N/A" else -1


##################
# User Endpoints #
##################
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if not all(k in data for k in ("username", "email", "password")):
                return JsonResponse({'error': 'Missing fields'}, status=400)

            user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
            user.save()
            return JsonResponse({'message': 'User created successfully'})
        except Exception as e:
            # Log the exception for internal review
            print(f"Registration Error: {e}")
            return JsonResponse({'error': 'An error occurred during registration'}, status=500)
    else:
        return HttpResponse("Method not allowed", status=405)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        # Basic input validation can be added here if necessary

        user = authenticate(username=username, password=password)

        if user is not None:
            # Generate or retrieve a token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        else:
            # Return a generic error message
            return Response({'error': 'Invalid login credentials'}, status=400)
    except Exception as e:
        # Log the exception for internal monitoring
        print(f"Login Error: {e}")
        # Return a generic error response
        return Response({'error': 'An error occurred during login'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    try:
        # Include necessary user data
        user_data = {
            'username': request.user.username,
            'email': request.user.email,
        }

        return Response(user_data)

    except Exception as e:
        # Log the error for debugging purposes
        logger.error(f"Error in get_current_user: {e}")

        # Return a generic error message to the client
        return JsonResponse({'error': 'An error occurred while fetching user data'}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    data = json.loads(request.body)

    username = data.get('username')
    email = data.get('email')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not (username or email or new_password):
        return JsonResponse({'error': 'No update information provided'}, status=400)

    try:
        if new_password:
            if not current_password:
                return JsonResponse({'error': 'Current password is required to change password'}, status=400)
            if not user.check_password(current_password):
                return JsonResponse({'error': 'Incorrect current password'}, status=401)
            user.set_password(new_password)
        
        if username:
            user.username = username
        if email:
            user.email = email

        user.save()
        return JsonResponse({'message': 'User information successfully updated'})

    except Exception as e:
        logger.error(f"Update User Error: {e}")
        return JsonResponse({'error': 'An error occurred during the update'}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    # Ensure that the user ID is an integer
    try:
        user_id = int(user_id)
    except ValueError:
        return JsonResponse({'error': 'Invalid user ID format'}, status=400)

    # Check if the requested user ID matches the logged-in user's ID
    if request.user.id != user_id:
        # Return a generic unauthorized error message
        return JsonResponse({'error': 'Unauthorized access'}, status=403)

    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return JsonResponse({'message': 'User successfully deleted'})

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Delete User Error: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


#######################
# Watchlist Endpoints #
#######################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_watchlist(request):
    try:
        data = json.loads(request.body)
        if 'title' not in data:
            return JsonResponse({'error': 'Missing title'}, status=400)

        Watchlist.objects.create(user=request.user, watchlist_title=data['title'])
        return JsonResponse({'message': 'Watchlist created successfully'})

    except Exception as e:
        logger.error(f"Error in create_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_watchlists(request):
    try:
        watchlists = Watchlist.objects.filter(user=request.user).values('watchlist_id', 'watchlist_title')
        return JsonResponse(list(watchlists), safe=False)

    except Exception as e:
        logger.error(f"Error in get_watchlists: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_watchlist(request, watchlist_id):
    try:
        data = json.loads(request.body)

        # Input Validation
        title = data.get('title')
        if not title:
            raise ValidationError("Title is required.")

        # Retrieve and update the specific watchlist
        try:
            watchlist = Watchlist.objects.get(watchlist_id=watchlist_id, user=request.user)
            watchlist.watchlist_title = title
            watchlist.save()
            return HttpResponse(status=204)
        except Watchlist.DoesNotExist:
            return JsonResponse({'error': 'Watchlist not found or unauthorized'}, status=404)

    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f"Error in update_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_watchlist(request, watchlist_id):
    try:
        watchlist_id = int(watchlist_id)
    except ValueError:
        return JsonResponse({'error': 'Invalid watchlist ID'}, status=400)

    try:
        # Retrieve and delete the specific watchlist
        watchlist = Watchlist.objects.get(watchlist_id=watchlist_id, user=request.user)
        watchlist.delete()
        return HttpResponse(status=204)
    except Watchlist.DoesNotExist:
        return JsonResponse({'error': 'Watchlist not found or unauthorized access'}, status=404)
    except Exception as e:
        logger.error(f"Error in delete_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)


###################
# Anime Endpoints #
###################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_or_create_anime(request):
    try:
        data = json.loads(request.body)
        if 'title' not in data:
            return JsonResponse({'error': 'Title is required'}, status=400)

        anime, created = Anime.objects.get_or_create(
            title=data['title'],
            defaults=data  # Assuming all necessary fields are provided in data
        )

        return JsonResponse({'anime_id': anime.id})

    except Exception as e:
        logger.error(f"Error in get_or_create_anime: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_anime_to_database(request):
    try:
        data = json.loads(request.body)
        required_fields = ['title', 'anime_status', 'episode_count', 'episode_length', 'release_year', 'rating', 'description', 'poster_image_url']
        if not all(field in data for field in required_fields):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        Anime.objects.create(**data)
        return JsonResponse({'message': 'Anime added to database'})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in add_anime_to_database: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)


#############################
# Anime-Watchlist Endpoints #
#############################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_anime_to_watchlist(request):
    try:
        data = json.loads(request.body)
        if 'anime_id' not in data or 'watchlist_id' not in data:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        AnimeWatchlist.objects.create(anime_id=data['anime_id'], watchlist_id=data['watchlist_id'])
        return JsonResponse({'message': 'Anime added to watchlist'})

    except Exception as e:
        logger.error(f"Error in add_anime_to_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_anime_from_watchlist(request, watchlist_id, anime_id):
    try:
        # Ensure inputs are integers
        watchlist_id = int(watchlist_id)
        anime_id = int(anime_id)

        # Use Django ORM to delete the AnimeWatchlist entry
        AnimeWatchlist.objects.filter(watchlist_id=watchlist_id, watchlist__user=request.user, anime_id=anime_id).delete()
        return HttpResponse(status=204)

    except ValueError:
        return JsonResponse({'error': 'Invalid watchlist or anime ID'}, status=400)
    except Exception as e:
        logger.error(f"Error in delete_anime_from_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_or_find_anime(request):
    try:
        data = json.loads(request.body)
        # Validate inputs
        if 'title' not in data or 'releaseYear' not in data:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Using Django ORM for database interactions
        anime, created = Anime.objects.get_or_create(
            title=data['title'],
            defaults={
                'release_year': data['releaseYear'],
                'num_episodes': data['episodeCount'],
                'time_per_episode': data['episodeLength'],
                'anime_rating': data['rating'],
                'description': data['description'],
                'status': data['status']
            }
        )

        anime_id = anime.pk
        return JsonResponse({'anime_id': anime_id})
    except ValueError as e:
        # Log the error for internal review
        print(f"Error in add_or_find_anime: {e}")
        return JsonResponse({'error': 'Invalid input format'}, status=400)
    except Exception as e:
        # Log the error for internal review
        print(f"Error in add_or_find_anime: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_anime_by_watchlist(request, watchlist_id):
    # Validate watchlist_id
    if not str(watchlist_id).isdigit():
        return JsonResponse({'error': 'Invalid watchlist ID'}, status=400)

    # Use Django ORM for secure queries (if possible)
    try:
        # Assuming Anime and Anime_Watchlist are Django models
        anime_list = Anime.objects.filter(anime_watchlist__watchlist_id=watchlist_id).values()
        return JsonResponse(list(anime_list), safe=False)
    except Exception as e:
        # Log the exception internally for review
        print(f"Error in get_anime_by_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred while fetching anime list'}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_anime_from_watchlist(request, watchlist_id, anime_id):
    # Validate inputs (example validation, adjust according to your needs)
    if not isinstance(watchlist_id, int) or not isinstance(anime_id, int):
        return JsonResponse({'error': 'Invalid input'}, status=400)

    connection = create_db_connection()
    if not connection:
        # Log this error internally instead of printing
        # Log error: Database connection failed
        return JsonResponse({'error': 'Server error. Please try again later.'}, status=500)

    try:
        cursor = connection.cursor()
        query = "DELETE FROM Anime_Watchlist WHERE watchlist_id = %s AND anime_id = %s"
        cursor.execute(query, (watchlist_id, anime_id))
        connection.commit()

        if cursor.rowcount == 0:
            return JsonResponse({'error': 'No matching entry found in the watchlist'}, status=404)

        return HttpResponse(status=204)
    except mysql.connector.Error as err:
        # Log the detailed error for internal review
        # Log error: Error while deleting anime from watchlist
        return JsonResponse({'error': 'Server error. Please try again later.'}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
