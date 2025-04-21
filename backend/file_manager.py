import os
from fastapi import UploadFile, HTTPException
from pathlib import Path

UPLOAD_FOLDER = Path(__file__).parent.parent / "uploads"

# Ensure the upload folder exists
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Allowed file types (extend this based on your use case)
ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def allowed_file(filename: str) -> bool:
    """Check if the file has a valid extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_file_size(file: UploadFile) -> None:
    """Check if the file exceeds the maximum allowed size."""
    file_size = len(file.file.read())
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File is too large")
    file.file.seek(0)  # Reset file pointer after checking size

def save_uploaded_file(file: UploadFile):
    """Save the uploaded file to the server."""
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    check_file_size(file)

    file_location = UPLOAD_FOLDER / file.filename
    with open(file_location, "wb") as f:
        f.write(file.file.read())
    
    return file_location
