from langgraph.graph import StateGraph,START,END
from agents.model import model
from agents.state import State
from agents.analyze import analyze_tool

graph_builder = StateGraph(State)

graph_builder.add_node("analyze", analyze_tool)

graph = graph_builder.compile()