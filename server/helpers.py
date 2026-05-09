import io

def extract_text_from_bytes(contents: bytes, filename: str) -> str:
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext == 'txt':
        return contents.decode('utf-8', errors='ignore')
    elif ext == 'pdf':
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            return " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
        except ImportError:
            return "PyPDF2 is required to parse PDF files. Please install it."
        except Exception as e:
            return f"Error reading PDF: {e}"
    elif ext == 'docx':
        try:
            import docx
            doc = docx.Document(io.BytesIO(contents))
            return " ".join([para.text for para in doc.paragraphs])
        except ImportError:
            return "python-docx is required to parse DOCX files. Please install it."
        except Exception as e:
            return f"Error reading DOCX: {e}"
    return contents.decode('utf-8', errors='ignore')
