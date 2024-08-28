from jose import JWTError, jwt
from jose.utils import base64url_decode
from jose import jwk
from jose.constants import ALGORITHMS
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import os

# Cognito pool configuration

# for local environment
#COGNITO_REGION = "ap-southeast-1"
#COGNITO_USERPOOL_ID = "ap-southeast-1_crJBQ7yo6"
#COGNITO_APP_CLIENT_ID = "4kqil27q4dcielr3vbdqqemkm5"
#COGNITO_JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json"

# for production environment
COGNITO_REGION = os.getenv("COGNITO_REGION")
COGNITO_USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")


# Get JWKS (JSON Web Key Set) from Cognito
jwks = requests.get(COGNITO_JWKS_URL).json()

def get_cognito_public_key(token):
    header = jwt.get_unverified_header(token)
    key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header.")
    return jwk.construct(key)

# Verifying the JWT token
def verify_jwt(token: str):
    try:
        public_key = get_cognito_public_key(token)
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHMS.RS256], audience=COGNITO_APP_CLIENT_ID)

        # Print the payload for debugging
        #print("Decoded JWT payload:", payload)

        if 'email' not in payload and 'cognito:username' not in payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or Username not found in token.")
        
        return payload  # Return the payload for access in the routes
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

security = HTTPBearer()

# Dependency that can be used to enforce JWT verification on routes
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_jwt(credentials.credentials)