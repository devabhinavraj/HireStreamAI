import re
from io import BytesIO
from pypdf import PdfReader
import docx

# A predefined list of common tech skills for extraction
COMMON_SKILLS = set([
    "python", "java", "c++", "c#", "javascript", "typescript", "react", "angular", "vue",
    "node.js", "express", "django", "flask", "fastapi", "spring boot", "sql", "mysql", "postgresql",
    "mongodb", "redis", "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "tableau", "power bi", "excel", "html", "css", "sass",
    "tailwind", "bootstrap", "rest api", "graphql", "agile", "scrum", "jira", "linux", "bash"
])

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """
    Parses resume text from a file and extracts key information.
    """
    text = ""
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        text = extract_text_from_docx(file_bytes)
    else:
        text = file_bytes.decode("utf-8", errors="ignore")
        
    extracted = extract_entities(text)
    extracted["raw_text"] = text
    return extracted

def extract_entities(text: str) -> dict:
    """
    Uses regex and heuristics to extract emails, phones, and skills.
    """
    # Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else None
    
    # Extract Phone
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None
    
    # Extract Skills (simple intersection with predefined list)
    text_lower = text.lower()
    # Tokenize simply by words and punctuation
    words = set(re.findall(r'\b[a-z0-9+#-]+\b', text_lower))
    found_skills = list(COMMON_SKILLS.intersection(words))
    
    # In a real-world scenario, you would use spaCy NER or pattern matching here.
    # We are keeping it simple and fast.
    
    return {
        "email": email,
        "phone": phone,
        "skills": found_skills
    }
