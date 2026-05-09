"""
HireStreamAI — Semantic Embedder
==================================
Generates dense vector embeddings using Sentence Transformers.
Computes cosine similarity between resume ↔ job description embeddings.

Model: all-MiniLM-L6-v2  (fast, 384-dim, excellent for semantic similarity)
"""

import numpy as np
from typing import Union
from loguru import logger

try:
    from sentence_transformers import SentenceTransformer
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False
    logger.warning("sentence-transformers not installed. Falling back to TF-IDF similarity.")

from sklearn.metrics.pairwise import cosine_similarity

from config import settings
from preprocessor import TextPreprocessor


class SemanticEmbedder:
    """
    Wraps SentenceTransformer for resume ↔ JD semantic similarity.
    Falls back to TF-IDF cosine similarity if sentence-transformers is unavailable.
    """

    _instance = None  # Singleton — model loading is expensive

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.preprocessor = TextPreprocessor()
        if ST_AVAILABLE:
            logger.info(f"Loading Sentence Transformer: {settings.SENTENCE_TRANSFORMER_MODEL}")
            self.model = SentenceTransformer(settings.SENTENCE_TRANSFORMER_MODEL)
            self.use_st = True
        else:
            self.model = None
            self.use_st = False
            logger.warning("Using TF-IDF fallback for similarity.")
        self._initialized = True

    # ── Public API ────────────────────────────────────────────────────────────

    def encode(self, text: Union[str, list[str]]) -> np.ndarray:
        """
        Encode text(s) into embedding vectors.

        Args:
            text: Single string or list of strings

        Returns:
            numpy array of shape (n_texts, embedding_dim)
        """
        if isinstance(text, str):
            text = [text]

        if self.use_st:
            embeddings = self.model.encode(text, convert_to_numpy=True, show_progress_bar=False)
        else:
            # TF-IDF fallback
            from sklearn.feature_extraction.text import TfidfVectorizer
            vec = TfidfVectorizer(max_features=1000, stop_words="english")
            embeddings = vec.fit_transform(text).toarray()

        return embeddings

    def similarity(self, text1: str, text2: str) -> float:
        """
        Compute cosine similarity between two texts.

        Args:
            text1: Resume text
            text2: Job description text

        Returns:
            Similarity score in [0, 1]
        """
        if self.use_st:
            emb1 = self.encode(text1)
            emb2 = self.encode(text2)
            score = cosine_similarity(emb1, emb2)[0][0]
        else:
            # TF-IDF fallback: fit on both texts together
            from sklearn.feature_extraction.text import TfidfVectorizer
            vec = TfidfVectorizer(max_features=1000, stop_words="english")
            matrix = vec.fit_transform([text1, text2]).toarray()
            score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return float(max(0.0, min(1.0, score)))

    def batch_similarity(self, query: str, documents: list[str]) -> list[float]:
        """
        Compute similarity between one query and multiple documents.
        Efficient: encodes all at once.
        """
        if self.use_st:
            query_emb = self.encode(query)
            doc_embs = self.encode(documents)
            scores = cosine_similarity(query_emb, doc_embs)[0]
        else:
            from sklearn.feature_extraction.text import TfidfVectorizer
            all_texts = [query] + documents
            vec = TfidfVectorizer(max_features=1000, stop_words="english")
            matrix = vec.fit_transform(all_texts).toarray()
            scores = cosine_similarity(matrix[0:1], matrix[1:])[0]
        return [float(max(0.0, min(1.0, s))) for s in scores]

    def most_similar(
        self,
        query: str,
        documents: list[str],
        top_n: int = 5,
    ) -> list[tuple[int, float]]:
        """
        Return indices and scores of top-N most similar documents.

        Returns:
            List of (index, score) tuples sorted by score descending
        """
        scores = self.batch_similarity(query, documents)
        ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        return ranked[:top_n]
