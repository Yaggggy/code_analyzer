import os
import json
from google.generativeai import configure, GenerativeModel
from dotenv import load_dotenv

# Load environment variables from a .env file one level up from this script
load_dotenv(dotenv_path='../.env')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit()

try:
    print("API Key loaded successfully.")
    configure(api_key=GEMINI_API_KEY)
    model = GenerativeModel("gemini-2.5-flash-preview-05-20")

    test_code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
    """

    prompt = f"""
    Analyze the following code snippet and provide its time and space complexity.
    Additionally, provide a detailed, professional explanation for your analysis.
    Respond with only a JSON object. Do not include any other text, explanations, or code outside the JSON object.

    JSON object format:
    - "time_complexity": string
    - "space_complexity": string
    - "explanation": string
    
    Code:
    {test_code}
    """
    
    print("Making a request to the Gemini API...")
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    # Attempt to parse the JSON response
    analysis_result = json.loads(response_text)
    
    print("\n--- API Call Successful ---")
    print(f"Time Complexity: {analysis_result['time_complexity']}")
    print(f"Space Complexity: {analysis_result['space_complexity']}")
    print(f"Explanation: {analysis_result['explanation']}")

except json.JSONDecodeError as e:
    print("\n--- API Call Failed ---")
    print(f"JSON Decode Error: {e}")
    print(f"Raw response from API was: '{response_text}'")
except Exception as e:
    print("\n--- API Call Failed ---")
    print(f"An unexpected error occurred: {e}")