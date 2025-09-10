from pinecone import Pinecone
from config import CONFIG

pc = Pinecone(api_key=CONFIG.get_env("PINECONE_SECRET"))

index = "logs-vectorized"

async def query_store(query : str):
    results = await pc.IndexAsyncio(name=index).search(
        namespace="",
        query= {
            "top_k" : 10,
            "inputs" : {
                "text" : query
            }
        },
        rerank= {
            "model" : "",
            "top_n" : 10,
            "rank_fields" : ["metadata"]
        }
    )

    return results