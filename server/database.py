import os
from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "hirestreamai"

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {MONGODB_URL}...")
    try:
        db.client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        db.db = db.client[DATABASE_NAME]
        # Ping the server to verify connection
        await db.client.admin.command('ping')
        logger.info(f"✅ Successfully connected to MongoDB database: {DATABASE_NAME}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        # We don't raise here to allow the app to start, but routes will fail gracefully

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    db.client.close()
    logger.info("MongoDB connection closed!")
