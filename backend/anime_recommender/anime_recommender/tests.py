from django.test import TestCase, Client
from django.urls import reverse
import anime_recommender.views as views

class ScraperTest(TestCase):
    def setUp(self):
        self.client = Client()
    
    def testFunction(self):
        response = self.client.get(reverse('runScraper'))
        
        