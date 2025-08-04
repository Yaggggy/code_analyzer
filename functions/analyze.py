import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from google.generativeai import configure, GenerativeModel

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

configure(api_key=GEMINI_API_KEY)
model = GenerativeModel("gemini-2.5-flash-preview-05-20")

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/.netlify/functions/analyze")
async def analyze_code(request: Request):
    try:
        data = await request.json()
        code = data.get("code")

        if not code:
            return JSONResponse(content={"error": "No code provided"}, status_code=400)

        prompt = f"""
        Analyze the following code snippet and provide its time and space complexity.
        Additionally, provide a detailed, professional explanation for your analysis.
        Format the response as a JSON object with the following keys:
        - "time_complexity": string
        - "space_complexity": string
        - "explanation": string
        
        Code:
        {code}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        analysis_result = json.loads(response_text)
        
        return JSONResponse(content=analysis_result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

handler = Mangum(app)