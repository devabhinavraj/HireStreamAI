from fastapi import APIRouter, Depends
from typing import List
from database import db
from models import DashboardStats, Activity, UserInDB
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: UserInDB = Depends(get_current_user)):
    # Total users (for admin visibility, but here just generic platform stats)
    total_users = await db.db.users.count_documents({})
    total_resumes = await db.db.resumes.count_documents({})
    
    # User specific stats (could also return these)
    # However, for "Admin Analytics Features", we show global stats
    
    # For now, let's assume this is for the user dashboard but shows platform-wide stats as requested in requirement 3
    # "Total registered users", "Total resumes uploaded", etc.
    
    # Recent activities (global for admin, user-specific for user)
    # The requirement says "Recent activities feed" in Admin Analytics
    recent_activities = await db.db.activities.find({}).sort("createdAt", -1).limit(10).to_list(10)
    
    # For a real SaaS, we might filter this by user role (admin)
    # But as per user request, we want to see these numbers.
    
    return {
        "totalUsers": total_users,
        "totalResumes": total_resumes,
        "totalAnalyses": total_resumes, # Assuming 1:1 for now
        "activeSubscriptions": total_users, # Mocking as all active for now
        "recentActivities": [Activity(**a) for a in recent_activities]
    }

@router.get("/user-growth")
async def get_user_growth():
    # Mocking time-series data for charts since we might not have enough data points yet
    # In production, this would use MongoDB aggregation by date
    return [
        {"date": "2024-01", "users": 120},
        {"date": "2024-02", "users": 210},
        {"date": "2024-03", "users": 450},
        {"date": "2024-04", "users": 890},
        {"date": "2024-05", "users": 1500},
    ]

@router.get("/resume-stats")
async def get_resume_stats():
    return [
        {"name": "Mon", "uploads": 45},
        {"name": "Tue", "uploads": 52},
        {"name": "Wed", "uploads": 38},
        {"name": "Thu", "uploads": 65},
        {"name": "Fri", "uploads": 48},
        {"name": "Sat", "uploads": 23},
        {"name": "Sun", "uploads": 15},
    ]
