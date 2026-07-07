import sys
import time
import os
import shutil
import tempfile
import requests
from seleniumbase import Driver

def create_proxy_auth_extension(proxy_string):
    """
    Creates a Chrome extension to handle proxy authentication (bypassing the login prompt).
    Returns the path to the extension folder.
    """
    try:
        # Strip whitespace and trailing slashes
        proxy_string = proxy_string.strip().rstrip('/')
        
        print(f"DEBUG:Parsing proxy: {proxy_string}", flush=True)
        
        # Parse logic: expected format http://user:pass@host:port or user:pass@host:port
        # Strip protocol if present
        if "://" in proxy_string:
            proxy_string = proxy_string.split("://")[1]
        
        if "@" not in proxy_string:
            print("ERROR:Proxy format invalid - missing '@' separator", file=sys.stderr)
            return None # No auth needed or invalid format

        # Split user:pass and host:port
        auth_part, host_part = proxy_string.split("@")
        
        if ":" not in auth_part:
            print("ERROR:Auth part invalid - missing ':' between username and password", file=sys.stderr)
            return None
            
        username, password = auth_part.split(":", 1)  # Use split with maxsplit=1 in case password has ':'
        
        if ":" not in host_part:
            print("ERROR:Host part invalid - missing ':' between host and port", file=sys.stderr)
            return None
            
        # Handle potential trailing slash in host_part
        host_part = host_part.rstrip('/')
        host, port = host_part.split(":", 1)
        
        # Remove any query parameters or paths
        if '/' in port:
            port = port.split('/')[0]

        print(f"DEBUG:Parsed - Host: {host}, Port: {port}, User: {username}", flush=True)

        # Create a temp directory for the extension
        extension_dir = os.path.join(tempfile.gettempdir(), "sb_proxy_auth_ext")
        if os.path.exists(extension_dir):
            shutil.rmtree(extension_dir)
        os.makedirs(extension_dir)

        # manifest.json
        # manifest.json (V3)
        manifest_json = """
        {
            "version": "1.0.0",
            "manifest_version": 3,
            "name": "Chrome Proxy Auth",
            "permissions": [
                "proxy",
                "webRequest",
                "webRequestAuthProvider"
            ],
            "host_permissions": [
                "<all_urls>"
            ],
            "background": {
                "service_worker": "background.js"
            },
            "minimum_chrome_version":"22.0.0"
        }
        """

        # background.js
        background_js = f"""
        var config = {{
            mode: "fixed_servers",
            rules: {{
              singleProxy: {{
                scheme: "http",
                host: "{host}",
                port: parseInt({port})
              }},
              bypassList: ["localhost"]
            }}
          }};
        
        chrome.proxy.settings.set({{value: config, scope: "regular"}}, function() {{}});
        
        function callbackFn(details) {{
            return {{
                authCredentials: {{
                    username: "{username}",
                    password: "{password}"
                }}
            }};
        }}
        
        chrome.webRequest.onAuthRequired.addListener(
                    callbackFn,
                    {{urls: ["<all_urls>"]}},
                    ['blocking']
        );
        """

        with open(os.path.join(extension_dir, "manifest.json"), "w") as f:
            f.write(manifest_json)
        
        with open(os.path.join(extension_dir, "background.js"), "w") as f:
            f.write(background_js)
        
        print(f"SUCCESS:Proxy extension created at {extension_dir}", flush=True)
        return extension_dir

    except Exception as e:
        print(f"ERROR:Failed to create proxy extension: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None

def launch_browser():
    proxy_arg = sys.argv[1] if len(sys.argv) > 1 else None
    if proxy_arg:
        print(f"INFO:Received proxy argument: {proxy_arg}", flush=True)
    
    # Mobile Window Sizes (iPhone, Pixel, Samsung)
    import random
    mobile_window_sizes = [
        (375, 812),   # iPhone X/XS/11 Pro
        (390, 844),   # iPhone 12/13/14
        (414, 896),   # iPhone XR/11/XS Max
        (428, 926),   # iPhone 12/13/14 Pro Max
        (412, 915),   # Pixel 6/7
        (360, 800),   # Samsung S20/S21/S22
        (384, 854),   # Generic Mobile
    ]
    
    # Use mobile sizes by default as per user request
    window_width, window_height = random.choice(mobile_window_sizes)
    print(f"INFO:Using MOBILE window size: {window_width}x{window_height}", flush=True)
    
    # Helper to find Chrome binary
    def find_chrome_binary():
        paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chrome",
            "/usr/local/bin/google-chrome",
            "/usr/local/bin/google-chrome-stable",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" # Mac support
        ]
        for path in paths:
            if os.path.exists(path):
                return path
        return None

    chrome_bin = find_chrome_binary()
    if chrome_bin:
        print(f"INFO:Found Chrome binary at: {chrome_bin}", flush=True)
    else:
        print("WARNING:Chrome binary not found in standard paths. Relying on auto-detect...", flush=True)

    try:
        # Initialize Driver
        if proxy_arg:
            print(f"INFO:Launching with PROXY arg: {proxy_arg}", flush=True)
            # Use standard proxy argument (proxy-chain handles auth upstream)
            driver = Driver(
                uc=True, 
                proxy=proxy_arg, 
                headless=False,
                mobile=True, # ENABLE MOBILE EMULATION
                page_load_strategy='normal',
                uc_subprocess=True,  # Helpful for Linux/Colab
                no_sandbox=True,      # CRITICAL for Colab (running as root)
                binary_location=chrome_bin # Explicitly set binary location
            )

        else:
            print("INFO:Launching without proxy (Direct Connection)", flush=True)
            driver = Driver(
                uc=True, 
                headless=False,
                mobile=True, # ENABLE MOBILE EMULATION
                page_load_strategy='normal',
                uc_subprocess=True,
                no_sandbox=True,
                binary_location=chrome_bin
            )
        
        # Disable WebRTC to prevent IP leaks
        try:
            driver.execute_cdp_cmd("Network.setEmulatedVisionDeficiency", {"type": "none"})
        except:
            pass
        
        # Set random window size
        try:
            driver.set_window_size(window_width, window_height)
            print(f"SUCCESS:Window size set to {window_width}x{window_height}", flush=True)
        except Exception as e:
            print(f"WARNING:Could not set window size: {e}", flush=True)
    
        # Get the debugger address
        debugger_address = driver.capabilities.get("goog:chromeOptions", {}).get("debuggerAddress")
        
        if debugger_address:
            try:
                response = requests.get(f"http://{debugger_address}/json/version")
                data = response.json()
                ws_url = data.get("webSocketDebuggerUrl")
                if ws_url:
                    print(f"CDP_ENDPOINT:{ws_url}", flush=True)
                else:
                    print("ERROR:No WebSocket URL found", file=sys.stderr)
            except Exception as e:
                print(f"ERROR:Failed to fetch WS URL: {e}", file=sys.stderr)
        else:
             print("ERROR:No debuggerAddress in capabilities", file=sys.stderr)

        # Keep alive
        while True:
            time.sleep(1)

    except Exception as e:
        print(f"ERROR:{str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    launch_browser()
