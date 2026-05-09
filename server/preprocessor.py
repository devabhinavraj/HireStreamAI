"""
HireStreamAI — Text Preprocessor
==================================
Standard NLP preprocessing pipeline:
  - Lowercasing
  - Special character removal
  - Stopword removal
  - Tokenization
  - Lemmatization
  - TF-IDF vectorization utilities
"""

import re
import string
from functools import lru_cache
from typing import Union

import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from loguru import logger

# Download required NLTK data (best-effort; graceful fallback if network unavailable)
for resource in ["punkt", "stopwords", "wordnet", "omw-1.4", "punkt_tab"]:
    try:
        nltk.data.find(f"tokenizers/{resource}")
    except LookupError:
        nltk.download(resource, quiet=True)

# Graceful fallback for NLTK components
try:
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import word_tokenize
    STOP_WORDS = set(stopwords.words("english"))
    STOP_WORDS -= {"no", "not", "above", "below", "before", "after", "more", "most"}
    NLTK_AVAILABLE = True
except Exception:
    logger.warning("NLTK resources unavailable — using basic tokenization fallback.")
    STOP_WORDS = {
        "a","an","the","and","or","but","in","on","at","to","for","of","with",
        "by","from","is","are","was","were","be","been","being","have","has",
        "had","do","does","did","will","would","could","should","may","might",
        "this","that","these","those","it","its","i","we","you","he","she","they",
    }
    NLTK_AVAILABLE = False


class TextPreprocessor:
    """
    Reusable NLP preprocessing pipeline.
    All methods are stateless and safe to call concurrently.
    """

    def __init__(self):
        self.lemmatizer = WordNetLemmatizer() if NLTK_AVAILABLE else None

    # ── Public Methods ────────────────────────────────────────────────────────

    def preprocess(self, text: str, keep_stopwords: bool = False) -> str:
        """
        Full pipeline: clean → tokenize → remove stopwords → lemmatize → rejoin.

        Args:
            text: Raw input text
            keep_stopwords: Set True when feeding to TF-IDF (it handles stopwords)

        Returns:
            Cleaned, lemmatized string
        """
        text = self._lowercase(text)
        text = self._remove_special_chars(text)
        tokens = self._tokenize(text)
        if not keep_stopwords:
            tokens = self._remove_stopwords(tokens)
        tokens = self._lemmatize(tokens)
        return " ".join(tokens)

    def get_tokens(self, text: str) -> list[str]:
        """Return list of preprocessed tokens."""
        return self.preprocess(text).split()

    def build_tfidf_vectorizer(
        self,
        corpus: list[str],
        max_features: int = 5000,
        ngram_range: tuple = (1, 2),
    ) -> TfidfVectorizer:
        """
        Fit a TF-IDF vectorizer on a corpus.

        Args:
            corpus: List of documents
            max_features: Vocabulary cap
            ngram_range: Unigrams + bigrams by default

        Returns:
            Fitted TfidfVectorizer
        """
        logger.info(f"Fitting TF-IDF on {len(corpus)} documents...")
        vec = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            stop_words="english",
            sublinear_tf=True,     # Apply log normalization to TF
            min_df=1,
            max_df=0.95,
        )
        vec.fit(corpus)
        logger.info(f"TF-IDF vocabulary size: {len(vec.vocabulary_)}")
        return vec

    def extract_keywords(self, text: str, top_n: int = 20) -> list[str]:
        """
        Extract top N keywords from text using TF-IDF on a single document.
        Useful for keyword-density scoring.
        """
        vec = TfidfVectorizer(
            max_features=200,
            stop_words="english",
            ngram_range=(1, 2),
        )
        try:
            tfidf_matrix = vec.fit_transform([text])
            scores = zip(vec.get_feature_names_out(), tfidf_matrix.toarray()[0])
            sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
            return [word for word, _ in sorted_scores[:top_n]]
        except ValueError:
            return []

    # ── Private Methods ───────────────────────────────────────────────────────

    def _lowercase(self, text: str) -> str:
        return text.lower()

    def _remove_special_chars(self, text: str) -> str:
        # Keep alphanumerics, spaces, and hyphens (for compound skills)
        text = re.sub(r"[^\w\s\-\+#\.]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _tokenize(self, text: str) -> list[str]:
        if NLTK_AVAILABLE:
            return word_tokenize(text)
        return text.split()

    def _remove_stopwords(self, tokens: list[str]) -> list[str]:
        return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]

    def _lemmatize(self, tokens: list[str]) -> list[str]:
        if NLTK_AVAILABLE and self.lemmatizer:
            return [self.lemmatizer.lemmatize(t) for t in tokens]
        return tokens
