import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from google.generativeai import configure, GenerativeModel
import logging
import uvicorn
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from the .env file at the root of the project for local dev
load_dotenv(dotenv_path='../.env')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY environment variable not set.")
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

def extract_json_from_markdown(text):
    """Extracts a JSON object from a Markdown code block."""
    try:
        start_index = text.find('```json')
        if start_index == -1:
            return text
        
        end_index = text.find('```', start_index + 1)
        if end_index == -1:
            end_index = len(text)
        
        json_content = text[start_index + 7:end_index].strip()
        return json_content
    except Exception as e:
        logger.error(f"Failed to extract JSON from Markdown: {e}")
        return text

@app.post("/analyze")
async def analyze_code(request: Request):
    logger.info("Function 'analyze_code' received a request.")
    try:
        data = await request.json()
        code = data.get("code")
        logger.info(f"Received code snippet of length: {len(code)}")

        if not code:
            logger.error("No code provided in the request body.")
            return JSONResponse(content={"error": "No code provided"}, status_code=400)

        prompt = f"""
        Analyze the following code snippet and provide its time and space complexity.
        Additionally, provide a detailed, professional explanation for your analysis.
        Respond with only a JSON object. Do not include any other text, explanations, or code outside the JSON object.

        JSON object format:
        - "time_complexity": string
        - "space_complexity": string
        - "explanation": string
        
        Code:
        {code}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        logger.info(f"Received raw response from Gemini: {response_text[:100]}...")

        json_content = extract_json_from_markdown(response_text)
        analysis_result = json.loads(json_content)
        
        return JSONResponse(content=analysis_result)

    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {e}. Raw response: {response_text}")
        return JSONResponse(content={"error": "Failed to parse API response. Please try again."}, status_code=500)
    except Exception as e:
        logger.exception("An unexpected error occurred during code analysis.")
        return JSONResponse(content={"error": str(e)}, status_code=500)

handler = Mangum(app)

if __name__ == "__main__":
    uvicorn.run("analyze:app", host="0.0.0.0", port=8000, reload=True)