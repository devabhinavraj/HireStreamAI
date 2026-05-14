from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load the Sentence Transformer model
# all-MiniLM-L6-v2 is fast and effective for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> np.ndarray:
    """
    Generates an embedding vector for a given text.
    """
    # encode returns a numpy array
    embedding = model.encode([text])
    return embedding[0]

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculates cosine similarity between two texts.
    Returns a score between 0.0 and 1.0.
    """
    if not text1 or not text2:
        return 0.0
    
    emb1 = get_embedding(text1).reshape(1, -1)
    emb2 = get_embedding(text2).reshape(1, -1)
    
    similarity = cosine_similarity(emb1, emb2)[0][0]
    return float(similarity)

def calculate_similarity_batch(source_text: str, target_texts: list[str]) -> list[float]:
    """
    Calculates cosine similarity between a source text and a list of target texts.
    Useful for job matching against multiple JDs.
    """
    if not source_text or not target_texts:
        return []
        
    source_emb = get_embedding(source_text).reshape(1, -1)
    target_embs = model.encode(target_texts)
    
    similarities = cosine_similarity(source_emb, target_embs)[0]
    return similarities.tolist()
