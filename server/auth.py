from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from loguru import logger
from datetime import datetime

from database import db
from models import UserCreate, UserInDB, UserResponse, Token, LoginRequest
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token
from validation import validate_password

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = await db.db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate):
    logger.info(f"📝 Signup attempt for email: {user_in.email}")
    
    # Check if database is initialized
    if db.db is None:
        logger.error("❌ Database connection is not initialized!")
        raise HTTPException(status_code=500, detail="Database connection error")

    # Check if user exists
    existing_user = await db.db["users"].find_one({"email": user_in.email})
    if existing_user:
        logger.warning(f"⚠️ Signup failed: Email {user_in.email} already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Create user
        logger.info("🔐 Hashing password...")
        validation_error = validate_password(user_in.password)
        if validation_error:
            raise HTTPException(status_code=400, detail=validation_error)
        hashed_password = get_password_hash(user_in.password)
        
        user_dict = user_in.model_dump()
        del user_dict["password"]
        user_dict["hashed_password"] = hashed_password
        
        logger.info("💾 Inserting user into MongoDB...")
        # Ping the server to verify connection before operation
        await db.client.admin.command('ping')
        new_user = await db.db["users"].insert_one(user_dict)
        
        created_user = await db.db["users"].find_one({"_id": new_user.inserted_id})
        logger.info(f"✅ User created successfully with ID: {new_user.inserted_id}")
        
        user_resp = UserResponse(**created_user)
        logger.info(f"🎫 Generating JWT access token for: {user_resp.fullName}")
        access_token = create_access_token(data={"sub": user_resp.email})
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_resp}
    except Exception as e:
        logger.error(f"💥 Critical error during signup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await db.db["users"].find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    user_resp = UserResponse(**user)
    access_token = create_access_token(data={"sub": user_resp.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_resp}

@router.get("/profile", response_model=UserResponse)
async def read_profile(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(user_update: dict, current_user: UserInDB = Depends(get_current_user)):
    await db.db["users"].update_one(
        {"_id": current_user.id},
        {"$set": user_update}
    )
    updated_user = await db.db["users"].find_one({"_id": current_user.id})
    return UserResponse(**updated_user)

@router.post("/logout")
async def logout():
    # In JWT, logout is handled client-side by deleting the token.
    # We can implement a token blacklist here if needed for higher security.
    return {"message": "Successfully logged out"}
