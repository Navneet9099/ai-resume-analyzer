import pypdf
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from raw PDF bytes using pure-Python pypdf.
    Since pypdf is written in 100% Python, it compiles instantly on any OS.
    """
    try:
        # Load PDF bytes stream into an in-memory buffer
        pdf_stream = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_stream)
        
        if len(reader.pages) == 0:
            raise ValueError("The PDF has no pages.")

        text_content = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
        
        full_text = "\n".join(text_content).strip()
        if not full_text:
            raise ValueError("Extracted text is empty. The PDF might contain only scanned images or be empty.")
            
        return full_text
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
