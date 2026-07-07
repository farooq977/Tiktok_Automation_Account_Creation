import requests
import time

# User confirmed this format works: http://kajhhcdk-rotate:ym2103jw4lbf@p.webshare.io:80
proxy = "http://kajhhcdk-rotate:ym2103jw4lbf@p.webshare.io:80"
proxies = {
    "http": proxy,
    "https": proxy,
}

print(f"Testing proxy: {proxy}")

for i in range(1, 6):
    try:
        start = time.time()
        # Using verifying URL
        response = requests.get("https://ipv4.webshare.io/", proxies=proxies, timeout=10)
        ip = response.text.strip()
        print(f"Request {i}: IP -> {ip} (Time: {time.time() - start:.2f}s)")
    except Exception as e:
        print(f"Request {i}: Failed -> {e}")
    time.sleep(2)
