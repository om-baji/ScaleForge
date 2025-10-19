from pydantic import BaseModel
from enum import Enum

class SeverityEnum(str, Enum):
    High = 'high'
    Medium = 'medium'
    Low = 'low'

class Response(BaseModel):
    cause : str
    service : str
    severity : SeverityEnum
    possible_fixes : str