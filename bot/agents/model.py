from langchain.chat_models import init_chat_model
from langgraph.graph.message import add_messages
from typing import Annotated
from typing_extensions import TypedDict
from dotenv import load_dotenv

load_dotenv()

llm = init_chat_model(model="google-gemini-flash-2.5")

class Output(TypedDict):
    query : Annotated[str,add_messages]
    context : list[str]

model = llm.with_structured_output(Output)
