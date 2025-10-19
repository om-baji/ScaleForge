import os

class Secrets:

    _instance = None

    @classmethod
    def __new__(self):
        if not self._instance:
            self._instance = Secrets
        return self._instance

    def get_env(self,str : str):
        return os.getenv(str,None)
    
CONFIG = Secrets.__new__()