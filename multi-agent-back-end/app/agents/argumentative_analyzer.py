import google.generativeai as genai
from app.utils.file_loader import load_instruction

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArgumentativeAnalyzerAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        self.instruction = load_instruction('argumentative.md')

    async def analyze(self, text: str, topic: str, motivational_texts: str = "") -> str:
        """
        Performs argumentative analysis on the given text.
        """
        prompt = self.instruction.format(
            topic_goes_here=topic,
            motivational_texts_go_here=motivational_texts,
            user_text_goes_here=text
        )
        logger.info(f"Generated prompt for argumentative analysis: {prompt}")
        response = await self.model.generate_content_async(prompt)
        logger.info(f"Full response from argumentative analysis: {response.parts}")
        return response.text
