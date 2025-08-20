from typing import Annotated
from typing_extensions import TypedDict

class State(TypedDict):
    context : list[str]
    query : str