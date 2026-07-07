import requests
import time
import random
import string

base_user = "fsynjmig-1"
password = "ii0oxx4ugxsd"
host = "p.webshare.io:80"

print(f"Testing rotation with session IDs...")

for i in range(1, 6):
    try:
        session_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        # Webshare format: usually just different ports, but let's try standard session injection
        # Try: username-rotate (if supported) or just verify if session works
        # Actually Webshare usually gives different PORTS for different IPs in the list download.
        # But let's try the common 'username-session-ID' format just in case.
        
        # Note: Webshare standard rotating proxy usually doesn't use session logic like this on the main port? 
        # But let's try modifying the username slightly if it allows sub-users or similar. 
        # Actually, let's try appending nothing first, maybe wait longer? No 2s is enough.
        
        # Let's try to assume it might be 'fsynjmig-1' ?
        # If this fails (407 Proxy Auth Required), then it doesn't support dynamic sessions.
        
        username_with_session = f"{base_user}" 
        # Uncomment below to test session if you think it works, but for Webshare usually you need to use the LIST.
        # username_with_session = f"{base_user}-session-{session_id}" 
        
        proxy_url = f"http://{username_with_session}:{password}@{host}"
        
        proxies = {"http": proxy_url, "https": proxy_url}
        
        start = time.time()
        response = requests.get("https://ipv4.webshare.io/", proxies=proxies, timeout=10)
        ip = response.text.strip()
        print(f"Request {i}: IP -> {ip} (Time: {time.time() - start:.2f}s) [User: {username_with_session}]")
    except Exception as e:
        print(f"Request {i}: Failed -> {e}")
    time.sleep(2)
