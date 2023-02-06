AUTHENTICATION_SOURCES = ['oauth2']
OAUTH2_AUTO_CREATE_USER = True
OAUTH2_CONFIG = [{
    'OAUTH2_NAME': 'authentik',
    'OAUTH2_DISPLAY_NAME': 'Efrei Craft',
    'OAUTH2_CLIENT_ID': '1efcf5933fca85aad6fab40192a6c889c63cdf67',
    'OAUTH2_CLIENT_SECRET': 'd875ff0ffa3fcc5e46eec6c02979c34c1b59217892e35788b83d38fb26ae8baf974bb9d38758121b7dda0269d0bf32001c375d14ad6f61809f978c15a8de72af',
    'OAUTH2_TOKEN_URL': 'https://auth.dev.efreicraft.fr/application/o/token/',
    'OAUTH2_AUTHORIZATION_URL': 'https://auth.dev.efreicraft.fr/application/o/authorize/',
    'OAUTH2_API_BASE_URL': 'https://auth.dev.efreicraft.fr/',
    'OAUTH2_USERINFO_ENDPOINT': 'https://auth.dev.efreicraft.fr/application/o/userinfo/',
    'OAUTH2_SERVER_METADATA_URL': 'https://auth.dev.efreicraft.fr/application/o/pgadmin/.well-known/openid-configuration',
    'OAUTH2_SCOPE': 'openid email profile',
    'OAUTH2_USERNAME_CLAIM': 'preferred_username',
    'OAUTH2_ICON': '',
    'OAUTH2_BUTTON_COLOR': '#71B048'
}]
