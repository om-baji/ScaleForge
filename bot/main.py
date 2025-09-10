from fastapi import FastAPI
from agents.model import model
from agents.state import State

app = FastAPI()

@app.get("/")
def hello():
    model.invoke("What are your capabilities?")
    return "Hello"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=9000, log_level="info")