from typing import Dict, Any
from enum import Enum

class AgentStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# Simple in-memory status tracker
status_tracker: Dict[str, Any] = {}

def get_status(run_id: str) -> Any:
    return status_tracker.get(run_id)

def update_status(run_id: str, agent_name: str, status: AgentStatus, result: Any = None):
    if run_id not in status_tracker:
        status_tracker[run_id] = {}
    status_tracker[run_id][agent_name] = {"status": status, "result": result}

def init_status(run_id: str, agents: list):
    status_tracker[run_id] = {agent: {"status": AgentStatus.PENDING} for agent in agents}
