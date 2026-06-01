# from datetime import datetime, timedelta
# from jose import jwt, JWTError
# from passlib.context import CryptContext
# from app.core.config import settings

# #from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# # هاش الـ password
# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)

# # تحقق من الـ password
# def verify_password(plain: str, hashed: str) -> bool:
#     return pwd_context.verify(plain, hashed)

# # عمل JWT token
# def create_access_token(data: dict) -> str:
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# # فك الـ token وجيب البيانات
# def decode_token(token: str) -> dict:
#     try:
#         return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#     except JWTError:
#         return None




import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings

# هاش الـ password
def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

# تحقق من الـ password
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# عمل JWT token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# فك الـ token وجيب البيانات
def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None