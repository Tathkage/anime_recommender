import asyncio
from scraper import topAnime

async def main():
    anime_info = await topAnime()
    print(anime_info)

if __name__ == "__main__":
    asyncio.run(main())
