"""
HireStreamAI — FastAPI Application Entry Point
================================================
Wires together all API routers and configures the app.
"""

import sys
import os

# Ensure the 'server' directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from contextlib import asynccontextmanager
from config import settings
from database import connect_to_mongo, close_mongo_connection
import resume, matching, recommendations, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="🚀 AI-Powered Resume Screening & Smart Job Matching Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,             prefix="/api/auth", tags=["Authentication"])
app.include_router(resume.router,           prefix="",  tags=["Resume"])
app.include_router(matching.router,         prefix="",  tags=["Matching & Scoring"])
app.include_router(recommendations.router,  prefix="",  tags=["Recommendations"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status":  "running ✅",
        "docs":    "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} initialised")
