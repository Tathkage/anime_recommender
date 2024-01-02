# Standard library imports
import json

# Django imports
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

# Django Rest Framework imports
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# Third-party imports
import mysql.connector
from decouple import config

# Local application imports
import anime_recommender.scraper.scraper as scraper


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

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
        # Add more user details if needed
        user.save()
        return JsonResponse({'message': 'User created successfully'})
    elif request.method == 'GET':
            return HttpResponse("GET requests are not supported for this endpoint.", status=405)
    else:
        return HttpResponse("Method not allowed", status=405)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Generate or retrieve a token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    else:
        return Response({'error': 'Invalid Credentials'}, status=400)
    

#######################
# Watchlist Endpoints #
#######################

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def create_watchlist(request):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        query = "INSERT INTO Watchlist (user_id, watchlist_title) VALUES (%s, %s)"
        cursor.execute(query, (request.user.id, data['title']))
        connection.commit()
        new_watchlist_id = cursor.lastrowid
        return JsonResponse({'watchlist_id': new_watchlist_id})
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_watchlists(request):
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT watchlist_id, watchlist_title FROM Watchlist WHERE user_id = %s"
        cursor.execute(query, (request.user.id,))
        watchlists = cursor.fetchall()  # Ensure all results are fetched
        return JsonResponse(watchlists, safe=False)
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()  # Close the cursor after fetching results
            connection.close()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_watchlist(request, watchlist_id):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        query = "UPDATE Watchlist SET watchlist_title = %s WHERE watchlist_id = %s AND user_id = %s"
        cursor.execute(query, (data['title'], watchlist_id, request.user.id))
        connection.commit()
        return HttpResponse(status=204)
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def delete_watchlist(request, watchlist_id):
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        query = "DELETE FROM Watchlist WHERE watchlist_id = %s AND user_id = %s"
        cursor.execute(query, (watchlist_id, request.user.id))
        connection.commit()
        if cursor.rowcount == 0:
            # No rows affected, possibly due to non-existent watchlist ID
            return JsonResponse({'error': 'No watchlist found with provided ID'}, status=404)
        return HttpResponse(status=204)
    except mysql.connector.Error as err:
        print("Error while deleting watchlist:", err)  # Log the error for debugging
        return JsonResponse({'error': 'Failed to delete watchlist'}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

###################
# Anime Endpoints #
###################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_or_create_anime(request):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT anime_id FROM Anime WHERE title = %s"
        cursor.execute(query, (data['title'],))
        result = cursor.fetchone()

        if result:
            anime_id = result['anime_id']
        else:
            insert_query = """
                INSERT INTO Anime (title, anime_status, ...)
                VALUES (%s, %s, ...)
            """
            cursor.execute(insert_query, (...))
            connection.commit()
            anime_id = cursor.lastrowid
        return JsonResponse({'anime_id': anime_id})
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_anime_to_database(request):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        # Before inserting, check if the anime is in the database
        anime_id = get_or_create_anime(request).json()['anime_id']
        data = json.loads(request.body)
        data['anime_id'] = anime_id  # Update anime_id in the data
        query = """
        INSERT INTO Anime (title, anime_status, episode_count, episode_length, release_year, rating, description, poster_image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data['title'], data['anime_status'], data['episode_count'], data['episode_length'], data['release_year'], data['rating'], data['description'], data['poster_image_url']))
        connection.commit()
        return JsonResponse({'message': 'Anime added to database'})
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

#############################
# Anime-Watchlist Endpoints #
#############################
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_anime_to_watchlist(request):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        query = "INSERT INTO Anime_Watchlist (anime_id, watchlist_id) VALUES (%s, %s)"
        cursor.execute(query, (data['anime_id'], data['watchlist_id']))
        connection.commit()
        return JsonResponse({'message': 'Anime added to watchlist'})
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_or_find_anime(request):
    data = json.loads(request.body)
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT anime_id FROM Anime WHERE anime_title = %s", (data['title'],))
        anime = cursor.fetchone()
        
        if anime:
            anime_id = anime[0]
        else:
            insert_query = "INSERT INTO Anime (anime_title, release_year, num_episodes, time_per_episode, anime_rating, description, status) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(insert_query, (data['title'], data['releaseYear'], data['episodeCount'], data['episodeLength'], data['rating'], data['description'], data['status']))
            connection.commit()
            anime_id = cursor.lastrowid
        return JsonResponse({'anime_id': anime_id})
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_anime_by_watchlist(request, watchlist_id):
    connection = create_db_connection()
    if not connection:
        return JsonResponse({'error': 'Database connection failed'}, status=500)

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM Anime WHERE anime_id IN (SELECT anime_id FROM Anime_Watchlist WHERE watchlist_id = %s)"
        cursor.execute(query, (watchlist_id,))
        anime_list = cursor.fetchall()
        return JsonResponse(anime_list, safe=False)
    except mysql.connector.Error as err:
        return JsonResponse({'error': str(err)}, status=500)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
