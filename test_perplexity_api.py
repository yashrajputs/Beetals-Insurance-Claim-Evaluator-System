import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_perplexity_api():
    api_key = os.getenv("PERPLEXITY_API_KEY")
    
    if not api_key:
        print("❌ No API key found in environment variables")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...")
    
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "Say hello in one word"}
        ],
        "temperature": 0.1,
        "stream": False
    }
    
    try:
        print("🔍 Testing API connection...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API connection successful!")
            result = response.json()
            print(f"📝 Response: {result.get('choices', [{}])[0].get('message', {}).get('content', 'No content')}")
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"❌ Timeout Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    test_perplexity_api()
