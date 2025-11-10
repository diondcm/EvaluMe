from pathlib import Path

def load_instruction(file_name: str) -> str:
    """Loads an instruction file from the root directory."""
    # Assuming instruction files are in the root of the container
    path = Path(file_name)
    if not path.is_file():
        # Fallback for local development if files are in a different relative location
        path = Path(__file__).parent.parent.parent / file_name
    
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
