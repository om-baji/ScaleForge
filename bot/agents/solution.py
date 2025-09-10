from langchain.tools import tool
from model import model
from .state import State

@tool
def solution_tool(state : State):
    """Provide eventual solution based on the possible causes and logs"""
    model.invoke(state['query'])
    pass