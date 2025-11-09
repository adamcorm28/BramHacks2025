from openai import AsyncOpenAI, OpenAI
import asyncio
from dotenv import load_dotenv

load_dotenv()


client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Say hello"}]
)

print("RESPONSE:", response.choices[0].message.content)

