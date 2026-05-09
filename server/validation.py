import re
from typing import Optional

# Regex patterns for validation
UPPER_REGEX = re.compile(r'[A-Z]')
LOWER_REGEX = re.compile(r'[a-z]')
DIGIT_REGEX = re.compile(r'\d')
SPECIAL_REGEX = re.compile(r'[!@#$%^&*(),.?\":{}|<>\[\]\\/\-_=+~`;\']')

def validate_password(password: str) -> Optional[str]:
    """Validate password against security policies.

    Returns None if password is valid, otherwise returns an error message.
    """
    # Length checks
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if len(password) > 20:
        return "Password must be no more than 20 characters long."
    # Bcrypt specific limit (72 bytes)
    if len(password.encode('utf-8')) > 72:
        return "Password is too long for secure hashing."
    # Character class checks
    if not UPPER_REGEX.search(password):
        return "Password must contain at least one uppercase letter."
    if not LOWER_REGEX.search(password):
        return "Password must contain at least one lowercase letter."
    if not DIGIT_REGEX.search(password):
        return "Password must contain at least one number."
    if not SPECIAL_REGEX.search(password):
        return "Password must contain at least one special character."
    return None
