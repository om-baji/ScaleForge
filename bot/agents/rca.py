import asyncio
from dotenv import load_dotenv
from store.rag import analyze_logs, search_logs

load_dotenv()

async def run_rca(issue_description: str):
    """Run root-cause analysis using the vector-store backed log analysis tool."""
    return await analyze_logs(issue_description)

if __name__ == "__main__":
    async def _main():
        print("Type an issue description to analyze (or 'exit'):")
        while True:
            try:
                user_input = input("You: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not user_input:
                continue
            if user_input.lower() in {"exit", "quit"}:
                break
            result = await run_rca(user_input)
            print("Analysis:", result)

    asyncio.run(_main())