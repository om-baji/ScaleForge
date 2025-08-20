from langchain.tools import tool
from model import model

@tool
def solution_tool(logs : list[str], causes : str):
    """Provide eventual solution based on the possible causes and logs"""
    model.invoke()
    pass