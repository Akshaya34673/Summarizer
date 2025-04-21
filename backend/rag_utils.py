import fitz
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

CHUNK_SIZE = 300
CHUNK_OVERLAP = 50
embedder = SentenceTransformer('all-MiniLM-L6-v2')

def chunk_text(text):
    words = text.split()
    return [
        " ".join(words[i:i + CHUNK_SIZE])
        for i in range(0, len(words), CHUNK_SIZE - CHUNK_OVERLAP)
    ]

def process_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = "".join(page.get_text() for page in doc)
    chunks = chunk_text(full_text)
    embeddings = embedder.encode(chunks)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return chunks, index

def get_top_chunks(query, chunks, index, top_k=5):
    query_vec = embedder.encode([query])
    D, I = index.search(np.array(query_vec), top_k)
    return [chunks[i] for i in I[0]]
