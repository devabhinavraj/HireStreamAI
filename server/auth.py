from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from loguru import logger
from datetime import datetime
from typing import List

from database import db
from models import UserCreate, UserInDB, UserResponse, Token, LoginRequest, Activity
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token
from validation import validate_password
from passlib.context import CryptContext

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def log_activity(user_id: str, activity_type: str, description: str):
    activity = {
        "userId": str(user_id),
        "type": activity_type,
        "description": description,
        "createdAt": datetime.utcnow()
    }
    await db.db["activities"].insert_one(activity)

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

@router.post("/signup")
async def signup(user: UserCreate):
    try:
        logger.info(f"🔥 Signup request received for {user.email}")
        
        # Validate password strength
        error_msg = validate_password(user.password)
        if error_msg:
            raise HTTPException(status_code=400, detail=error_msg)

        existing_user = await db.db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        hashed_password = pwd_context.hash(user.password)

        new_user_data = user.dict(by_alias=True, exclude={"password"})
        new_user_data["hashed_password"] = hashed_password
        new_user_data["createdAt"] = datetime.utcnow()
        new_user_data["updatedAt"] = datetime.utcnow()
        new_user_data["resumeCount"] = 0
        new_user_data["atsAverageScore"] = 0.0

        result = await db.db.users.insert_one(new_user_data)
        
        await log_activity(result.inserted_id, "signup", "User created a new account")

        # Fetch the created user to return it
        created_user = await db.db.users.find_one({"_id": result.inserted_id})
        user_resp = UserResponse(**created_user)
        access_token = create_access_token(data={"sub": user_resp.email})

        return {
            "message": "User created successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_resp
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌ SIGNUP ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during signup")

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await db.db["users"].find_one({"email": login_data.email})
    
    if not user or not verify_password(login_data.password, user.get("hashed_password") or user.get("password")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Update last login
    await db.db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.utcnow()}}
    )

    await log_activity(user["_id"], "login", "User logged into the platform")
    
    user_resp = UserResponse(**user)
    access_token = create_access_token(data={"sub": user_resp.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_resp}

@router.get("/profile", response_model=UserResponse)
async def read_profile(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(user_update: dict, current_user: UserInDB = Depends(get_current_user)):
    user_update["updatedAt"] = datetime.utcnow()
    
    # Ensure we don't accidentally overwrite sensitive fields via this endpoint
    protected_fields = ["_id", "email", "hashed_password", "role", "createdAt"]
    for field in protected_fields:
        user_update.pop(field, None)

    await db.db["users"].update_one(
        {"_id": current_user.id},
        {"$set": user_update}
    )
    
    await log_activity(current_user.id, "profile_update", "User updated their profile information")
    
    updated_user = await db.db["users"].find_one({"_id": current_user.id})
    return UserResponse(**updated_user)

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    await log_activity(current_user.id, "logout", "User logged out")
    return {"message": "Successfully logged out"}

@router.get("/activities", response_model=List[Activity])
async def get_user_activities(current_user: UserInDB = Depends(get_current_user)):
    activities = await db.db["activities"].find({"userId": str(current_user.id)}).sort("createdAt", -1).to_list(100)
    return activities
