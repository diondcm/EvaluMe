from typing import Dict, Any

# Simple in-memory cache
cache: Dict[str, Any] = {}

def get_from_cache(key: str) -> Any:
    return cache.get(key)

def set_in_cache(key: str, value: Any):
    cache[key] = value
