from bs4 import BeautifulSoup
import httpx
import re
import os
import string
import requests
from urllib.request import urlretrieve

GENRE_BASE_URL = "https://myanimelist.net/anime/genre/"

def sanitize_filename(filename):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    return ''.join(char if char in valid_chars else '_' for char in filename)

def save_image(url, title):
    image_directory = 'media/anime_images/'
    os.makedirs(image_directory, exist_ok=True)  # Create directory if it doesn't exist
    sanitized_title = sanitize_filename(title)
    file_extension = url.split('.')[-1]  # Extract the file extension from the URL
    file_name = f"{sanitized_title}.{file_extension}"
    file_path = os.path.join(image_directory, file_name)
    
    # Download the image and save it
    response = requests.get(url)
    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            f.write(response.content)
        return file_path
    else:
        raise Exception(f"Failed to download image from URL: {url}")

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
        
async def filterGenreUrls(genreNames):
    response = await scrapeWebsite("https://myanimelist.net/anime.php")
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    genreHeader = soup.find("div", class_="normal_header", string="Genres")   
    genreContainer = genreHeader.find_next_sibling("div", class_="genre-link")
    genreLinks = genreContainer.find_all("a", class_="genre-name-link")
    
    genres = {link.get_text(strip=True).split(" (")[0]: link['href'] for link in genreLinks}
    filteredGenres = {genre: url for genre, url in genres.items() if genre in genreNames}
    
    return filteredGenres

async def genreScraper(genre, urlSuffix):
    url = "https://myanimelist.net" + urlSuffix
    animeInfo = []
    currentPage = 1
    
    while url:
        response = await scrapeWebsite(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        animeCategories = soup.find_all("div", class_="js-anime-category-producer")
        
        for category in animeCategories:
            titleTag = category.find("span", class_="js-title")
            infoDiv = category.find("div", class_="info")
            ratingDiv = category.find("div", class_="scormem-item")
            descriptionP = category.find("p", class_="preline")
            imageDiv = category.find("div", class_="image")
            
            if titleTag and infoDiv and ratingDiv and descriptionP and imageDiv:
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

                # Extract the image URL from the image div
                imageUrl = imageDiv.find("img")["data-src"]
                localImagePath = save_image(imageUrl, animeTitle)
                completeImageUrl = f"http://localhost:8000/{localImagePath}"
                
                animeInfo.append({
                    "Title": animeTitle,
                    "Release Year": releaseYearTag,
                    "Status": statusTag,
                    "Episode Count": episodeCount,
                    "Episode Length": episodeLength,
                    "Description": animeDescription,
                    "Rating": animeRating,
                    "Genre": [genre],
                    "Image": completeImageUrl
                })
            
        paginationLinks = soup.find_all("a", class_="link", href=True)
        nextUrl = None

        for link in paginationLinks:
            match = re.search(r'page=(\d+)', link['href'])
            if match and int(match.group(1)) > currentPage:
                nextUrl = link['href']
                break
            
        currentPage+=1
        url = nextUrl if nextUrl else None
        
    return {"Anime Info": animeInfo}
