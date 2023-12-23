from bs4 import BeautifulSoup
import httpx
import re

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
    response = await scrapeWebsite("https://myanimelist.net/anime/genre/1/Action")  # Change the URL
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    animeCategories = soup.find_all("div", class_="js-anime-category-producer")
    animeInfo = []
    
    for category in animeCategories:
        titleTag = category.find("span", class_="js-title")
        infoDiv = category.find("div", class_="info")
        ratingDiv = category.find("div", class_="scormem-item")
        descriptionP = category.find("p", class_="preline")
        
        if titleTag and infoDiv and ratingDiv and descriptionP:
            animeTitle = titleTag.get_text(strip=True)
            
            # Extract release year from the first span in the info div
            releaseYearTag = infoDiv.find("span", class_="item").text.split(",")[1].strip()
            
            # Extract status from the second span in the info div
            statusTag = infoDiv.find_all("span", class_="item")[1].text.strip()
            
            # Extract episode count and episode length from the third span in the info div
            episodeInfo = infoDiv.find_all("span", class_="item")[2]
            episodeSpans = episodeInfo.find_all("span")
            
            # Use regular expressions to extract episode count and episode length
            episodeCountTag = next((span for span in episodeSpans if re.search(r'\d+\s+eps', span.text)), None)
            episodeLengthTag = next((span for span in episodeSpans if re.search(r'\d+\s+min', span.text)), None)
            
            episodeCount = re.search(r'(\d+)\s+eps', episodeCountTag.text).group(1) if episodeCountTag else None
            episodeLength = re.search(r'(\d+)\s+min', episodeLengthTag.text).group(1) if episodeLengthTag else None
            
            # Extract rating from the rating div
            animeRating = ratingDiv.get_text(strip=True)
            
            # Extract description from the description paragraph
            animeDescription = descriptionP.get_text(strip=True)
            
            animeInfo.append({
                "Title": animeTitle,
                "Release Year": releaseYearTag,
                "Status": statusTag,
                "Episode Count": episodeCount,
                "Episode Length": episodeLength,
                "Description": animeDescription,
                "Rating": animeRating
            })
            
            # print(f"Title: {animeTitle}, Release Year: {releaseYearTag}, Status: {statusTag}, Episode Count: {episodeCount}, Episode Length: {episodeLength}, Description: {animeDescription}, Rating: {animeRating}")
        
    return {"Anime Info": animeInfo}
