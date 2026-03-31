from jose import jwt
from datetime import datetime, timedelta

SECRET = "frost_secret_key"

def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token):
    return jwt.decode(token, SECRET, algorithms=["HS256"])
