import os 
from dotenv import load_dotenv
import httpx 


load_dotenv()

API_KEY = os.getenv("OPENCODE_API_KEY")  # Grabs the key from env
API_URL = os.getenv("OPENCODE_API_URL")  # Grabs the URL from env

def call_opencode(system_prompt:str, user_message:str) -> str:
    response = httpx.post(      # Send POST request to the LLM API
        API_URL,                # "https://opencode.ai/zen/v1/chat/completions"
        headers={"Authorization": f"Bearer {API_KEY}"},  # Auth header
        json={
            "model": "deepseek-v4-flash-free",  # Which model to use
            "messages": [
                {"role": "system", "content": system_prompt},  # System instruction
                {"role": "user", "content": user_message},      # User's message
            ],
        },
        timeout=60,             # Wait max 60s for response
    )
    response.raise_for_status() # Raise error if HTTP status isn't 200

    return response.json()["choices"][0]["message"]["content"]
    

