from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")
pdf_text = ""

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads folder
os.makedirs("uploads", exist_ok=True)


@app.get("/")
def home():
    return {"message": "AI Study Assistant Backend Running 🚀"}


@app.get("/study")
def study(topic: str):

    response = model.generate_content(
        f"""
You are an AI Study Assistant.

Answer ONLY using the uploaded PDF.

Format your answer beautifully.

Rules:
- Use headings.
- Use bullet points whenever possible.
- Explain in simple English.
- If there are steps, number them.
- Do NOT use ** or markdown symbols.
- Never return one long paragraph.
- Make the text user friendly, not clumsy paragraph.

PDF:
{pdf_text}

Question:
{topic}
"""
    )

    return {
        "topic": topic,
        "advice": response.text
    }

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global pdf_text
            
    # Save PDF
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Read PDF
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"

    global pdf_text
    pdf_text = text


    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "text": text
    }

@app.get("/summary")
def summary():

    response = model.generate_content(
        f"""
Summarize the following PDF in simple language.

PDF:
{pdf_text}
"""
    )

    return {
        "summary": response.text
    }

@app.get("/quiz")
def quiz(count: int = 5):
    if count not in [5, 10, 20]:
        return {"error": "Invalid quiz size"}

    response = model.generate_content(
        f"""
You are an AI Study Assistant.

Using ONLY the uploaded PDF content, create exactly {count} multiple-choice questions.

Return ONLY valid JSON in this exact structure:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Option B"
  }}
]

Rules:
- Use ONLY information from the PDF.
- Create exactly {count} questions.
- Each question must have exactly 4 options.
- The answer must be exactly one of the four options.
- Do NOT include markdown.
- Do NOT include ```json.
- Do NOT include explanations.
- Do NOT include anything before or after the JSON.

PDF Content:
{pdf_text}
"""
    )

    import json

    quiz_data = json.loads(response.text)

    return {
        "quiz": quiz_data
    }

@app.get("/flashcards")
def flashcards(count: int = 10):

    response = model.generate_content(
        f"""
You are an AI Study Assistant.

Using ONLY the uploaded PDF content, create exactly {count} flashcards.

Return ONLY valid JSON in this exact structure:

[
  {{
    "question": "Question text",
    "answer": "Answer text"
  }}
]

Rules:
- Use ONLY information from the PDF.
- Create exactly {count} flashcards.
- Each flashcard must contain one question and one answer.
- The answer must be directly supported by the PDF.
- Do NOT include markdown.
- Do NOT include ```json.
- Do NOT include explanations outside the JSON.
- Do NOT include anything before or after the JSON.

PDF Content:
{pdf_text}
"""
    )

    import json

    flashcard_data = json.loads(response.text)

    return {
        "flashcards": flashcard_data
    }
   