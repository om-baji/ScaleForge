from langchain.tools import tool
from model import model

@tool
def analyze_tool(logs : list[str]):
    """Analyze the logs and comment on it"""
    model.invoke()
    pass