import os

class Settings:
    APP_NAME: str = "HireStreamAI"
    APP_VERSION: str = "1.0.0"
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".txt"]
    MAX_UPLOAD_SIZE_MB: int = 5
    TOP_N_JOBS: int = 5
    SIMILARITY_THRESHOLD: float = 0.5
    DATA_DIR: str = "./data"
    SPACY_MODEL: str = "en_core_web_sm"
    SENTENCE_TRANSFORMER_MODEL: str = "all-MiniLM-L6-v2"

    # ATS Scoring Weights
    WEIGHT_SKILL_MATCH: float = 0.35
    WEIGHT_SEMANTIC_SIM: float = 0.30
    WEIGHT_EXPERIENCE: float = 0.20
    WEIGHT_EDUCATION: float = 0.10
    WEIGHT_KEYWORDS: float = 0.05

settings = Settings()
