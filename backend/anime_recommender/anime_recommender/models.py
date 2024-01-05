from django.db import models
from django.contrib.auth.models import User

class Anime(models.Model):
    anime_id = models.AutoField(primary_key=True)
    anime_title = models.CharField(max_length=255)
    release_year = models.IntegerField(null=True, blank=True)
    num_episodes = models.IntegerField(null=True, blank=True)
    time_per_episode = models.IntegerField(null=True, blank=True)
    anime_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.anime_title

class Watchlist(models.Model):
    watchlist_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    watchlist_title = models.CharField(max_length=255)

    def __str__(self):
        return self.watchlist_title

class AnimeWatchlist(models.Model):
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('anime', 'watchlist')
