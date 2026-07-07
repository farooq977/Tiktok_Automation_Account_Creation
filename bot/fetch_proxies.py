import requests
import json
import concurrent.futures

API_URL = "https://proxylist.geonode.com/api/proxy-list?protocols=https%2Csocks5&filterUpTime=50&speed=fast&google=false&limit=300&page=1&sort_by=lastChecked&sort_type=desc"

def fetch_proxies():
    print("Fetching proxies from GeoNode (Limit 300)...")
    try:
        response = requests.get(API_URL, timeout=15)
        data = response.json()
        return data.get("data", [])
    except Exception as e:
        print(f"Error fetching API: {e}")
        return []

def test_proxy(proxy_data):
    ip = proxy_data.get("ip")
    port = proxy_data.get("port")
    protocol = proxy_data.get("protocols", ["http"])[0]
    
    proxy_url = f"{protocol}://{ip}:{port}"
    proxies = {
        "http": proxy_url,
        "https": proxy_url
    }
    
    try:
        # Test against Google or similar to ensure they can access major sites
        # Increased timeout to 10s because free proxies are slow
        resp = requests.get("https://www.google.com", proxies=proxies, timeout=10)
        if resp.status_code == 200:
            return proxy_url
    except:
        pass
    return None

def main():
    raw_proxies = fetch_proxies()
    print(f"Found {len(raw_proxies)} candidates. Validating...")
    
    valid_proxies = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(test_proxy, raw_proxies)
        for res in results:
            if res:
                valid_proxies.append(res)
                print(f"✅ Found working proxy: {res}")
                if len(valid_proxies) >= 10: # Stop after finding enough
                    break
    
    print(f"Total valid proxies found: {len(valid_proxies)}")
    
    # Save to a file for the bot to read
    with open("valid_proxies.json", "w") as f:
        json.dump(valid_proxies, f)

if __name__ == "__main__":
    main()
