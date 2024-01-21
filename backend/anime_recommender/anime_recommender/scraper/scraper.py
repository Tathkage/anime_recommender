from bs4 import BeautifulSoup
import httpx

async def scrapeWebsite(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        response = await client.get(url)
        if response.status_code == 200:
            return response
        else:
            response.raise_for_status()
        
async def topAnime():
    response = await scrapeWebsite("https://myanimelist.net/topanime.php")
    
    soup = BeautifulSoup(response, 'html.parser')
    
    rankingRows = soup.find_all("tr", class_="ranking-list")
    animeInfo = []
    
    for row in rankingRows:
        titleTag = row.find("h3", class_="fl-l fs14 fw-b anime_ranking_h3")
        ratingTag = row.find("span", class_=["text on score-label score-9", "text on score-label score-8"])
        
        if titleTag and ratingTag:
            animeTitle = titleTag.get_text(strip=True)
            animeRating = ratingTag.get_text(strip=True)
            animeInfo.append({"Title": animeTitle, "Rating": animeRating})
            print(f"Title: {animeTitle}, Rating: {animeRating}")
        
    return {"Anime Info": animeInfo}