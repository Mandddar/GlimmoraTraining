import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)
model = genai.GenerativeModel("gemini-2.5-flash")


def generate_recommendation(student):

    prompt = f"""
    Student Name: {student.name}
    Course: {student.course}

    Provide:
    1. Recommended subjects to focus on
    2. Useful skills to learn
    3. Career advice

    Keep the response under 75 words.
    Use bullet points.
    """

    response = model.generate_content(prompt)

    return response.text