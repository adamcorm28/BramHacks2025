from openai import OpenAI
from dotenv import load_dotenv
import os


load_dotenv()

client = OpenAI()

messages = [
    {"role": "system", "content": "You are a chatbot acting as a physics and astronomy professor. You will only answer questions related to astrophysics, nothing else. Give a clear and concise answer."}
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

messages.append({"role": "user", "content": "Move the rover forward"})
response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)

messages.append({"role": "assistant", "content": response.choices[0].message.content})

print(response.choices[0].message.content)