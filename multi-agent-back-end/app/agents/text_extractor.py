import google.generativeai as genai
from PIL import Image
import io

class TextExtractorAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """
        Extracts text from an image using a multimodal model.
        """
        image = Image.open(io.BytesIO(image_bytes))
        prompt = "Extract the text from this image."
        response = await self.model.generate_content_async([prompt, image])
        return response.text
