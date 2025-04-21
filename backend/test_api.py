import requests

# Replace this with your actual API key
key = "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"  # <-- Replace this with your actual API key
headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "google/gemini-pro",
    "messages": [{"role": "user", "content": "Hello, world"}]
}

# Send the test request to the API
r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)

# Print out the response status and the content of the response
print("Response Status Code:", r.status_code)
print("Response JSON:", r.json())
