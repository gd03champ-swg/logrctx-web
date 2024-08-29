from jose import JWTError, jwt
from jose.utils import base64url_decode
from jose import jwk
from jose.constants import ALGORITHMS
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import requests
import os

load_dotenv()

# Cognito pool configuration
COGNITO_REGION = os.getenv("COGNITO_REGION")
COGNITO_USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")

COGNITO_JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json"

# Get JWKS (JSON Web Key Set) from Cognito
jwks = requests.get(COGNITO_JWKS_URL).json()

def get_cognito_public_key(token):
    header = jwt.get_unverified_header(token)
    key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header.")
    return jwk.construct(key)

# Split id token and access token from passed super token
def split_super_token(super_token: str):
    parts = super_token.split("|")
    if len(parts) != 2:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid super token.")
    return parts

# Verifying the JWT token
def verify_jwt(token: str):
    try:

        id_token, access_token = split_super_token(token)

        public_key = get_cognito_public_key(id_token)
        
        # Decode the JWT token
        payload = jwt.decode(
            id_token, 
            public_key, 
            algorithms=[ALGORITHMS.RS256], 
            audience=COGNITO_APP_CLIENT_ID,
            access_token=access_token  # Only provided for SSO tokens with at_hash claim
        )
        # Print the payload for debugging
        #print("Decoded JWT payload:", payload)

        # Handle the case where neither 'email' nor 'cognito:username' is present
        if 'email' not in payload and 'cognito:username' not in payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or Username not found in token.")
        
        return payload  # Return the payload for access in the routes

    except JWTError as e:
        print("Invalid token:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

security = HTTPBearer()

# Dependency that can be used to enforce JWT verification on routes
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_jwt(credentials.credentials)