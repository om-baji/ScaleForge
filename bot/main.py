import asyncio
from dotenv import load_dotenv
from store.rag import analyze_logs

load_dotenv()

async def _main():
    print("Log RCA assistant. Describe the issue to analyze (type 'exit' to quit).")
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            break
        result = await analyze_logs(user_input)
        print("Bot:")
        print(result)


if __name__ == "__main__":
    asyncio.run(_main())
