import sys
import os

# Add the parent directory to the path so we can import 'server'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from the server directory
from server.main import app
