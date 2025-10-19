from pinecone import Pinecone
from configs.config import CONFIG
from langchain.tools import tool
from langchain_groq import ChatGroq
from configs.models import Response
from typing import Any, Dict, List
from dotenv import load_dotenv

load_dotenv()

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

@tool("Log_search_tool")
async def search_logs(query : str):
    return await query_store(query)


def _format_logs_for_prompt(results: Any) -> str:
    """Convert Pinecone results into a compact, readable context block."""
    try:
        matches: List[Dict[str, Any]] = results.get("matches", []) if isinstance(results, dict) else getattr(results, "matches", [])
    except Exception:
        matches = []

    if not matches:
        return "No relevant logs were retrieved from the vector store."

    lines: List[str] = []
    for i, m in enumerate(matches[:10], start=1):
        metadata = m.get("metadata", {}) if isinstance(m, dict) else getattr(m, "metadata", {})
        text = metadata.get("text") or metadata.get("message") or m.get("text") or ""
        ts = metadata.get("timestamp") or metadata.get("ts") or ""
        svc = metadata.get("service") or metadata.get("svc") or ""
        lvl = metadata.get("level") or metadata.get("severity") or ""
        id_ = m.get("id") or getattr(m, "id", "")
        score = m.get("score") or getattr(m, "score", None)
        prefix = f"[{i}] id={id_} score={score} service={svc} level={lvl} ts={ts}"
        lines.append(prefix)
        if text:
            # keep a single line per log entry to keep prompt compact
            one_line = " ".join(str(text).split())
            lines.append(f"    {one_line}")
    return "\n".join(lines)


@tool("Log_analysis_tool")
async def analyze_logs(issue_description: str) -> Dict[str, Any]:
    """
    Analyze incident/root cause by retrieving relevant logs from the vector store and
    synthesizing a high-signal summary. Input should be a brief description of the issue/symptoms.
    Returns a structured object: { cause, service, severity, possible_fixes }.
    """
    # Retrieve relevant logs
    results = await query_store(issue_description)
    logs_context = _format_logs_for_prompt(results)

    # Prepare LLM with structured output
    llm = ChatGroq(model="gemma2-9b-it", temperature=0.3)
    structured = llm.with_structured_output(Response)

    system_instructions = (
        "You are an expert SRE assisting with incident triage. Be precise and concise. "
        "Use ONLY the provided logs context and the described symptoms. "
        "Return pragmatic findings and concrete fixes."
    )

    prompt = (
        f"System:\n{system_instructions}\n\n"
        f"Symptoms:\n{issue_description}\n\n"
        f"Relevant logs (top-k):\n{logs_context}\n\n"
        "Produce a structured root-cause assessment."
    )

    # Invoke synchronously inside async context (fast, single call)
    assessment: Response = structured.invoke(prompt)
    return assessment.model_dump()