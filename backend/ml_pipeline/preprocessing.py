import re
import string
import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def clean_text(text: str) -> str:
    """
    Cleans text by removing special characters, urls, and extra whitespace.
    """
    if not isinstance(text, str):
        return ""
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    # Remove emails
    text = re.sub(r'\S+@\S+', '', text)
    # Remove special characters and digits (optional, but good for pure semantic matching)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text.lower()

def preprocess_text(text: str) -> str:
    """
    Full preprocessing: cleaning + lemmatization + stopword removal.
    """
    cleaned = clean_text(text)
    doc = nlp(cleaned)
    tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and len(token.lemma_) > 1]
    return " ".join(tokens)

def extract_keywords(text: str) -> list[str]:
    """
    Extracts noun chunks and key entities.
    """
    doc = nlp(text)
    keywords = [chunk.text.lower() for chunk in doc.noun_chunks]
    return list(set(keywords))
