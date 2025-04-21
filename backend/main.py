from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from fastapi import Body
from spellchecker import SpellChecker
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import os
import requests
import pdfkit
import logging

from rag_utils import process_pdf, get_top_chunks
from llm_utils import summarize_with_llm, ask_question

# FastAPI app
app = FastAPI()

# Logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# PDF config (Windows)
WKHTMLTOPDF_PATH = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads and MongoDB setup
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MONGO_URI = "mongodb+srv://garigemurali715:WKreAHP1TTgG7Vy8@paperglance.jmouwby.mongodb.net/?retryWrites=true&w=majority&appName=paperglance"
client = MongoClient(MONGO_URI)
db = client["paper_summarizer"]

papers_collection = db["papers"]
summaries_collection = db["summaries"]
qa_collection = db["qa_history"]

chunks, index = [], None  # Global RAG state

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    global chunks, index
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        chunks, index = process_pdf(file_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to process PDF")

        summary = summarize_with_llm(chunks)

        paper_doc = {
            "filename": file.filename,
            "filepath": file_path,
            "upload_date": datetime.utcnow(),
            "file_size": os.path.getsize(file_path),
            "status": "processed"
        }
        paper_result = papers_collection.insert_one(paper_doc)

        summary_doc = {
            "paper_id": paper_result.inserted_id,
            "summary": summary,
            "created_at": datetime.utcnow(),
            "version": "initial"
        }
        summaries_collection.insert_one(summary_doc)

        formatted_date = datetime.utcnow().strftime("%m/%d/%Y")

        return {
            "paper_id": str(paper_result.inserted_id),
            "filename": file.filename,
            "summary": summary,
            "date": formatted_date
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/summarize/")
async def summarize_pdf(file: UploadFile = File(...), summary_length: str = Form("medium")):
    global chunks, index
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        chunks, index = process_pdf(file_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to process PDF")

        summary = summarize_with_llm(chunks, summary_length)

        paper_doc = {
            "filename": file.filename,
            "filepath": file_path,
            "upload_date": datetime.utcnow(),
            "file_size": os.path.getsize(file_path),
            "status": "processed"
        }
        paper_result = papers_collection.insert_one(paper_doc)

        summary_doc = {
            "paper_id": paper_result.inserted_id,
            "summary": summary,
            "length": summary_length,
            "created_at": datetime.utcnow(),
            "version": "custom"
        }
        summaries_collection.insert_one(summary_doc)

        return {
            "paper_id": str(paper_result.inserted_id),
            "summary": summary,
            "advantages": [],
            "disadvantages": [],
            "insights": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summaries/")
async def get_summaries(limit: int = 10):
    try:
        summaries = list(summaries_collection.find().sort("created_at", -1).limit(limit))
        for summary in summaries:
            summary["_id"] = str(summary["_id"])
            summary["paper_id"] = str(summary["paper_id"])
            summary["created_at"] = summary["created_at"].isoformat()

            paper = papers_collection.find_one({"_id": ObjectId(summary["paper_id"])})
            if paper:
                summary["filename"] = paper.get("filename", "Unknown")
                summary["upload_date"] = paper.get("upload_date").isoformat()

            # Include Q&A history
            qa_list = list(qa_collection.find({"paper_id": ObjectId(summary["paper_id"])}).sort("timestamp", -1))
            summary["qa_history"] = [
                {
                    "question": qa["question"],
                    "answer": qa["answer"],
                    "timestamp": qa["timestamp"].isoformat()
                } for qa in qa_list
            ]

        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/")
async def chat_with_paper(question: str = Form(...), paper_id: str = Form(...)):
    global chunks, index
    if not chunks or not index:
        raise HTTPException(status_code=400, detail="Please upload a PDF first to generate chunks.")
    try:
        top_chunks = get_top_chunks(question, chunks, index)
        answer = ask_question(question, top_chunks)

        # Save to MongoDB
        qa_doc = {
            "paper_id": ObjectId(paper_id),
            "question": question,
            "answer": answer,
            "timestamp": datetime.utcnow()
        }
        qa_collection.insert_one(qa_doc)

        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/download-summary/")
async def download_summary(request: Request):
    try:
        data = await request.json()
        summary_text = data.get("summary_text", "")
        if not summary_text:
            raise HTTPException(status_code=400, detail="No summary text provided")

        html_content = f"""
        <html><head><style>body {{ font-family: Arial; }}</style></head>
        <body><h1>Research Summary</h1><div>{summary_text}</div></body></html>
        """
        options = {'encoding': 'UTF-8', 'quiet': '', 'page-size': 'A4'}
        pdf_path = os.path.join(UPLOAD_DIR, "summary.pdf")
        pdfkit.from_string(html_content, pdf_path, options=options, configuration=config)
        return FileResponse(pdf_path, media_type='application/pdf', filename="research_summary.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.delete("/delete-summary/{summary_id}")
async def delete_summary(summary_id: str):
    try:
        result = summaries_collection.delete_one({"_id": ObjectId(summary_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Summary not found")
        return {"message": "Summary deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WordRequest(BaseModel):
    word: str

@app.post("/api/define")
async def define_word(request: WordRequest):
    spell = SpellChecker()
    corrected_word = spell.correction(request.word.lower())
    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{corrected_word}")
        if response.status_code == 200:
            definitions = []
            data = response.json()
            for meaning in data[0].get("meanings", []):
                part_of_speech = meaning.get("partOfSpeech", "")
                for definition in meaning.get("definitions", []):
                    definitions.append({
                        "partOfSpeech": part_of_speech,
                        "definition": definition.get("definition", ""),
                        "example": definition.get("example", "")
                    })
            return {
                "word": request.word,
                "suggested": corrected_word if corrected_word != request.word else "",
                "results": definitions
            }
        else:
            return JSONResponse(status_code=404, content={"error": f"No definition found for '{request.word}'"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
