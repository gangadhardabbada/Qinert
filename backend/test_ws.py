import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('ws://127.0.0.1:8000/api/v1/qonsole/execute') as ws:
            print("Connected successfully!")
            await ws.close()
    except Exception as e:
        print(f"Failed to connect: {e}")

asyncio.run(test())
