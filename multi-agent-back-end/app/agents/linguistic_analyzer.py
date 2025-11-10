import logging
import google.generativeai as genai
from app.utils.file_loader import load_instruction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LinguisticAnalyzerAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        self.instruction = load_instruction('linguistics.md')

    async def analyze(self, text: str) -> str:
        """
        Performs linguistic analysis on the given text.
        """
        prompt = self.instruction.format(user_text_goes_here=text)
        logger.info(f"Generated prompt for linguistic analysis: {prompt}")
        response = await self.model.generate_content_async(prompt)
        logger.info(f"Full response from linguistic analysis: {response.parts}")
        return response.text
