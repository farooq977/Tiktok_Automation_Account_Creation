import requests
import sys

proxy = "http://fsynjmig-1:ii0oxx4ugxsd@p.webshare.io:80"

print(f"Testing proxy: {proxy}")

try:
    proxies = {
        "http": proxy,
        "https": proxy,
    }
    
    # Timeout set to 10 seconds
    response = requests.get("https://ipv4.webshare.io/", proxies=proxies, timeout=10)
    
    if response.status_code == 200:
        print("\n✅ Proxy is working!")
        print(f"Current IP via Proxy: {response.text.strip()}")
    else:
        print(f"\n❌ Proxy responded with status code: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"\n❌ Proxy failed to connect: {str(e)}")
