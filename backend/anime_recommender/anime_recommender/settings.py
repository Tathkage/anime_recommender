import os
from pathlib import Path
from decouple import config

# BASE_DIR is the directory where manage.py resides
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY SETTINGS
# ------------------------------------------------------------------------------
# These settings are critical for your application's security posture

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Allowed hosts that can serve the application
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]'] if DEBUG else ['yourdomain.com']


# settings.py for development

# HTTP Strict Transport Security (HSTS)
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# SSL Redirect
SECURE_SSL_REDIRECT = False

# Secure Cookie
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True  # Use with HTTPS
SESSION_COOKIE_SAMESITE = 'None' # For cross-site cookie sharing
SESSION_COOKIE_SECURE = True  # Use with HTTPS


# # settings.py for production

# # HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# # SSL Redirect
# SECURE_SSL_REDIRECT = True

# # Secure Cookie
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True


# APPLICATION SETTINGS
# ------------------------------------------------------------------------------
# These settings define the applications and middleware that are active in the project

INSTALLED_APPS = [
    # Default Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    # 'defender',
    # Your apps
    'anime_recommender',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'defender.middleware.FailedLoginMiddleware',
]

# Allow credentials (cookies)
CORS_ALLOW_CREDENTIALS = True

# Cross-Origin Resource Sharing settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://localhost:8000",
]

# URL settings
ROOT_URLCONF = 'anime_recommender.urls'

# Template settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application path
WSGI_APPLICATION = 'anime_recommender.wsgi.application'

# DATABASE SETTINGS
# ------------------------------------------------------------------------------
# Database configuration is pulled from environment variables

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', cast=int),  # Default MySQL port
    }
}

# AUTHENTICATION AND PASSWORD VALIDATION
# ------------------------------------------------------------------------------
# Configuration for authentication and password management

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
]

# Defender Settings
DEFENDER_REDIS_URL = "redis://localhost:6379/0"
DEFENDER_STORE_ACCESS_ATTEMPTS = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'defender': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# REST FRAMEWORK SETTINGS
# ------------------------------------------------------------------------------
# Settings specific to Django REST framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'anime_recommender.authentication.CookieTokenAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',  # Example: 100 requests per day for anonymous users
        'user': '1000/day'  # Example: 1000 requests per day for logged-in users
    }
}

# INTERNATIONALIZATION AND LOCALIZATION SETTINGS
# ------------------------------------------------------------------------------
# These settings are used to configure the language and timezone settings

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC FILES SETTINGS
# ------------------------------------------------------------------------------
# Settings for static file serving

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
