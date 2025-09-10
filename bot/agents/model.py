from langchain.chat_models import init_chat_model
from langgraph.graph.message import add_messages
from typing import Annotated
from typing_extensions import TypedDict
from dotenv import load_dotenv

load_dotenv()

llm = init_chat_model(model="openai/gpt-oss-20b", model_provider="groq")

class Output(TypedDict):
    query : str
    context : list[str]

model = llm.with_structured_output(Output)
