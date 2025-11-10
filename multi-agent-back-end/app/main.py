import os
import uuid
import asyncio
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional

from app.agents.text_extractor import TextExtractorAgent
from app.agents.linguistic_analyzer import LinguisticAnalyzerAgent
from app.agents.argumentative_analyzer import ArgumentativeAnalyzerAgent
from app.services.cache import get_from_cache, set_in_cache
from app.services.status import init_status, update_status, get_status, AgentStatus

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a context-like dictionary to hold the agents
agents = {}

app = FastAPI()

async def run_analysis(run_id: str, extracted_text: str, topic: str, motivational_texts: Optional[str]):
    """
    This function runs the actual analysis in the background.
    """
    logger.info(f"Starting analysis for run_id: {run_id}")

    # Get agents from the context
    linguistic_analyzer = agents["linguistic_analyzer"]
    argumentative_analyzer = agents["argumentative_analyzer"]

    try:
        # 2. Run analysis agents in parallel
        update_status(run_id, "linguistic_analysis", AgentStatus.RUNNING)
        update_status(run_id, "argumentative_analysis", AgentStatus.RUNNING)
        
        linguistic_task = asyncio.create_task(linguistic_analyzer.analyze(extracted_text))
        argumentative_task = asyncio.create_task(argumentative_analyzer.analyze(extracted_text, topic, motivational_texts or ""))

        results = await asyncio.gather(linguistic_task, argumentative_task, return_exceptions=True)

        linguistic_result = results[0]
        argumentative_result = results[1]

        if isinstance(linguistic_result, Exception):
            error_message = f"Linguistic analysis failed: {linguistic_result}"
            tb = "".join(traceback.format_exception(type(linguistic_result), linguistic_result, linguistic_result.__traceback__))
            update_status(run_id, "linguistic_analysis", AgentStatus.FAILED, error_message)
            logger.error(f"Linguistic analysis failed for run_id: {run_id}: {linguistic_result}\n{tb}")
        else:
            update_status(run_id, "linguistic_analysis", AgentStatus.COMPLETED, linguistic_result)
            logger.info(f"Linguistic analysis completed for run_id: {run_id}")

        if isinstance(argumentative_result, Exception):
            error_message = f"Argumentative analysis failed: {argumentative_result}"
            tb = "".join(traceback.format_exception(type(argumentative_result), argumentative_result, argumentative_result.__traceback__))
            update_status(run_id, "argumentative_analysis", AgentStatus.FAILED, error_message)
            logger.error(f"Argumentative analysis failed for run_id: {run_id}: {argumentative_result}\n{tb}")
        else:
            update_status(run_id, "argumentative_analysis", AgentStatus.COMPLETED, argumentative_result)
            logger.info(f"Argumentative analysis completed for run_id: {run_id}")

        final_report = {
            "extracted_text": extracted_text,
            "linguistic_analysis": linguistic_result if not isinstance(linguistic_result, Exception) else {"error": str(linguistic_result)},
            "argumentative_analysis": argumentative_result if not isinstance(argumentative_result, Exception) else {"error": str(argumentative_result)},
        }

        # This part of the function is reached regardless of individual analysis failures
        image_hash = str(hash(extracted_text.encode())) # Re-hashing based on text for caching
        set_in_cache(image_hash, final_report)
        logger.info(f"Analysis process completed for run_id: {run_id}")

    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"An error occurred during analysis for run_id: {run_id}: {e}\n{tb}")
        # Update status of all running tasks to FAILED
        for agent_name in ["linguistic_analysis", "argumentative_analysis"]:
            current_status = get_status(run_id)
            if current_status and current_status.get(agent_name, {}).get('status') == AgentStatus.RUNNING.value:
                update_status(run_id, agent_name, AgentStatus.FAILED, str(e))

@app.on_event("startup")
async def startup_event():
    """
    Initialize agents on application startup.
    """
    API_KEY = os.environ.get("GOOGLE_API_KEY")
    if not API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")

    agents["text_extractor"] = TextExtractorAgent(api_key=API_KEY)
    agents["linguistic_analyzer"] = LinguisticAnalyzerAgent(api_key=API_KEY)
    agents["argumentative_analyzer"] = ArgumentativeAnalyzerAgent(api_key=API_KEY)

@app.post("/analyze-image/")
async def analyze_image(
    file: UploadFile = File(...),
    topic: str = Form(...),
    motivational_texts: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    run_id = str(uuid.uuid4())
    image_bytes = await file.read()
    image_hash = str(hash(image_bytes))

    # Check cache first
    cached_result = get_from_cache(image_hash)
    if cached_result:
        return JSONResponse(content={"run_id": run_id, "status": "COMPLETED_FROM_CACHE", "result": cached_result})

    # Initialize status for this run
    init_status(run_id, ["text_extraction", "linguistic_analysis", "argumentative_analysis"])

    # Get agents from the context
    text_extractor = agents["text_extractor"]

    # 1. Extract text from the image
    update_status(run_id, "text_extraction", AgentStatus.RUNNING)
    try:
        extracted_text = await text_extractor.extract_text_from_image(image_bytes)
        update_status(run_id, "text_extraction", AgentStatus.COMPLETED, extracted_text)
        logger.info(f"Text extraction completed for run_id: {run_id}")
    except Exception as e:
        update_status(run_id, "text_extraction", AgentStatus.FAILED, str(e))
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {e}")

    # Run the analysis in the background
    background_tasks.add_task(run_analysis, run_id, extracted_text, topic, motivational_texts)

    return JSONResponse(status_code=202, content={"run_id": run_id, "status": "ACCEPTED", "extracted_text": extracted_text})

@app.get("/status/{run_id}")
async def get_run_status(run_id: str):
    status = get_status(run_id)
    if not status:
        raise HTTPException(status_code=404, detail="Run ID not found.")
    return JSONResponse(content=status)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
