from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserBase(BaseModel):
    fullName: str = Field(..., alias="fullName")
    username: Optional[str] = None
    email: EmailStr
    profileImage: Optional[str] = Field(default=None, alias="profileImage")
    subscriptionPlan: str = Field(default="starter", alias="subscriptionPlan")
    role: str = "user"
    resumeCount: int = Field(default=0, alias="resumeCount")
    atsAverageScore: float = Field(default=0.0, alias="atsAverageScore")
    lastLogin: Optional[datetime] = Field(default=None, alias="lastLogin")
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        populate_by_name = True

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(UserBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Resume(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str = Field(..., alias="userId")
    fileName: str = Field(..., alias="fileName")
    fileUrl: str = Field(..., alias="fileUrl")
    fileType: str = Field(..., alias="fileType")
    atsScore: float = Field(default=0.0, alias="atsScore")
    parsedText: Optional[str] = Field(default=None, alias="parsedText")
    skills: List[str] = []
    recommendations: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Activity(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str = Field(..., alias="userId")
    type: str  # signup, login, upload, ats_gen, profile_update
    description: str
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class DashboardStats(BaseModel):
    totalUsers: int
    totalResumes: int
    totalAnalyses: int
    activeSubscriptions: int
    recentActivities: List[Activity]

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
