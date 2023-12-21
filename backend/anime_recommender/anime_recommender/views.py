from django.http import JsonResponse
import anime_recommender.scraper.scraper as scraper

async def runScraper(request):
    data = await scraper.topAnime()
    return JsonResponse(data, safe=False)
    