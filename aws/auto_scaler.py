import requests
import json
import time
import asyncio

async def check_status():
    res = requests.get("http://localhost:8080/cluster")
    print(json.dumps(res))

if __name__ == "__main__":
    while True:
        asyncio.run(check_status())
        time.sleep(2000)
        
    