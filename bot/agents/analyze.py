from langchain.tools import tool
from model import model
from .state import State

@tool
def analyze_tool(state : State):
    """Analyze the logs and comment on it"""
    model.invoke()
    pass