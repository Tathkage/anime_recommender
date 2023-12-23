from django.http import JsonResponse, HttpResponse
import anime_recommender.scraper.scraper as scraper
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json

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

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(request, username=data['username'], password=data['password'])
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    elif request.method == 'GET':
        return HttpResponse("GET requests are not supported for this endpoint.", status=405)
    else:
        return HttpResponse("Method not allowed", status=405)
