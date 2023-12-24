# Standard library imports
import json

# Django imports
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

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


async def runScraper(request, genre_number, genre_name):
    data = await scraper.topAnime(genre_number, genre_name)
    return JsonResponse(data, safe=False)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def create_watchlist(request):
    data = json.loads(request.body)

    # Use config to get database configurations from .env file
    connection = mysql.connector.connect(
        host=config('DB_HOST'),
        database=config('DB_NAME'),
        user=config('DB_USER'),
        password=config('DB_PASSWORD'),
        port=config('DB_PORT', cast=int)  # Ensure the port is cast to an integer
    )

    cursor = connection.cursor()
    query = "INSERT INTO Watchlist (user_id, watchlist_title) VALUES (%s, %s)"
    cursor.execute(query, (request.user.id, data['title']))
    connection.commit()
    cursor.close()
    connection.close()

    return JsonResponse({'message': 'Watchlist created'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_watchlists(request):
    # Database connection
    connection = mysql.connector.connect(
        host=config('DB_HOST'),
        database=config('DB_NAME'),
        user=config('DB_USER'),
        password=config('DB_PASSWORD'),
        port=config('DB_PORT', cast=int)
    )
    cursor = connection.cursor(dictionary=True)
    query = "SELECT watchlist_id, watchlist_title FROM Watchlist WHERE user_id = %s"
    cursor.execute(query, (request.user.id,))
    watchlists = cursor.fetchall()
    cursor.close()
    connection.close()
    return JsonResponse(watchlists, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_watchlist(request, watchlist_id):
    data = json.loads(request.body)
    # Database connection
    connection = mysql.connector.connect(
        host=config('DB_HOST'),
        database=config('DB_NAME'),
        user=config('DB_USER'),
        password=config('DB_PASSWORD'),
        port=config('DB_PORT', cast=int)
    )
    cursor = connection.cursor()
    query = "UPDATE Watchlist SET watchlist_title = %s WHERE id = %s AND user_id = %s"
    cursor.execute(query, (data['title'], watchlist_id, request.user.id))
    connection.commit()
    cursor.close()
    connection.close()
    return HttpResponse(status=204)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def delete_watchlist(request, watchlist_id):
    # Database connection
    connection = mysql.connector.connect(
        host=config('DB_HOST'),
        database=config('DB_NAME'),
        user=config('DB_USER'),
        password=config('DB_PASSWORD'),
        port=config('DB_PORT', cast=int)
    )
    cursor = connection.cursor()
    query = "DELETE FROM Watchlist WHERE id = %s AND user_id = %s"
    cursor.execute(query, (watchlist_id, request.user.id))
    connection.commit()
    cursor.close()
    connection.close()
    return HttpResponse(status=204)
