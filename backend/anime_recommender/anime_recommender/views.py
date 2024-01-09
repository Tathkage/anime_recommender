# Standard library imports
import json
import logging

# Django imports
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# Django Rest Framework imports
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

# Local application imports
from .models import Anime, Watchlist, AnimeWatchlist
import anime_recommender.scraper.scraper as scraper

# Logger
logger = logging.getLogger(__name__)

# Defender
# from defender import utils as defender_utils
        

################
# Web Scrapers #
################
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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


############################
# Authentication Endpoints #
############################
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if not all(k in data for k in ("username", "email", "password")):
                return JsonResponse({'error': 'Missing fields'}, status=400)

            # Validate password
            try:
                validate_password(data['password'])
            except ValidationError as e:
                # Process the error messages for a more specific response
                for message in e.messages:
                    if 'common' in message:
                        return JsonResponse({'error': 'Password is too common and a different one must be chosen.'}, status=400)
                    if 'too short' in message or 'at least 8 characters' in message:
                        return JsonResponse({'error': 'Password must be at least 8 characters long.'}, status=400)
                # General error message if the specific condition is not met
                return JsonResponse({'error': ' '.join(e.messages)}, status=400)

            user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
            user.save()
            return JsonResponse({'message': 'User created successfully'})
        except Exception as e:
            print(f"Registration Error: {e}")
            return JsonResponse({'error': 'An error occurred during registration'}, status=500)
    else:
        return HttpResponse("Method not allowed", status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_session(request):
    # If the request reaches here, the user is authenticated
    return Response({'authenticated': True})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        # defender_utils.reset_failed_attempts(request, username)
        token, _ = Token.objects.get_or_create(user=user)
        response = Response({'detail': 'Login Successful'})
        response.set_cookie(key='auth_token', value=token.key, httponly=True, samesite='Lax')
        return response
    else:
        # defender_utils.record_failed_attempt(request, username)
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def logout_user(request):
    response = Response({'detail': 'Logout Successful'})
    response.delete_cookie('auth_token')
    return response


##################
# User Endpoints #
##################
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
            # Validate new password
            try:
                validate_password(new_password)
            except ValidationError as e:
                # Process the error messages for a more specific response
                for message in e.messages:
                    if 'common' in message:
                        return JsonResponse({'error': 'Password is too common and a different one must be chosen.'}, status=400)
                    if 'too short' in message or 'at least 8 characters' in message:
                        return JsonResponse({'error': 'Password must be at least 8 characters long.'}, status=400)
                return JsonResponse({'error': ' '.join(e.messages)}, status=400)

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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def delete_user(request):
    user = request.user
    try:
        # Delete the user's authentication token
        Token.objects.filter(user=user).delete()

        # Now delete the user
        user.delete()

        # Create a response for successful deletion
        response = Response({'message': 'User successfully deleted'})
        # Delete the authentication cookie as part of the response
        response.delete_cookie('auth_token')
        return response

    except Exception as e:
        logger.error(f"Delete User Error: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


#######################
# Watchlist Endpoints #
#######################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
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
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def add_anime_to_database(request):
    try:
        data = json.loads(request.body)
        required_fields = ['anime_title', 'status', 'num_episodes', 'time_per_episode', 'release_year', 'anime_rating', 'description',]
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
        if 'anime_title' not in data or 'release_year' not in data:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Using Django ORM for database interactions
        anime, created = Anime.objects.get_or_create(
            anime_title=data['anime_title'],
            defaults={
                'release_year': data['release_year'],
                'num_episodes': data['num_episodes'],
                'time_per_episode': data['time_per_episode'],
                'anime_rating': data['anime_rating'],
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

    try:
        # Retrieve Anime ids from AnimeWatchlist for the given watchlist_id
        anime_ids = AnimeWatchlist.objects.filter(watchlist_id=watchlist_id).values_list('anime_id', flat=True)

        # Now retrieve Anime objects using the ids from above
        anime_list = Anime.objects.filter(anime_id__in=anime_ids).values()
        return JsonResponse(list(anime_list), safe=False)
    except Exception as e:
        # Log the exception internally for review
        print(f"Error in get_anime_by_watchlist: {e}")
        return JsonResponse({'error': 'An error occurred while fetching anime list'}, status=500)

