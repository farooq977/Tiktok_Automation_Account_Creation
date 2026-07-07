import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROXY_FILE = path.join(__dirname, '../../valid_proxies.json');

// Base proxy configuration (rotating proxy with -rotate suffix)
const baseProxyConfig = {
    username: 'qkgiufyj-rotate',  // Using -rotate suffix for automatic IP rotation
    password: 'nqc828ze9vua',
    host: 'p.webshare.io',
    port: '80'
};

// Get random proxy from the list
export const getRandomProxy = () => {
    // Build proxy URL - the -rotate suffix ensures each connection gets a new IP
    const proxy = `http://${baseProxyConfig.username}:${baseProxyConfig.password}@${baseProxyConfig.host}:${baseProxyConfig.port}`;

    // Mask password for logging
    console.log(`🌐 Using rotating proxy (auto IP rotation enabled)`);
    console.log(`🔄 Proxy: ${proxy.replace(/:[^:@]*@/, ':****@')}`);

    return proxy;
};

// Add proxy to the list
export const addProxy = (server, username, password) => {
    proxies.push({ server, username, password });
};

// Add multiple proxies from array
export const addProxies = (proxyList) => {
    proxyList.forEach(proxy => {
        proxies.push(proxy);
    });
    console.log(`✅ Loaded ${proxyList.length} proxies`);
};

// Get proxy count
export const getProxyCount = () => proxies.length;

import { exec } from 'child_process';

// Check if proxy is working using system CURL
export const checkProxyConnectivity = (proxy) => {
    return new Promise((resolve) => {
        if (!proxy) return resolve(false);

        // proxy format: http://user:pass@host:port
        // curl format: curl --proxy url target

        const target = 'https://www.google.com';
        const cmd = `curl -I --proxy "${proxy}" "${target}" --max-time 10 -s -o /dev/null -w "%{http_code}"`;

        console.log(`🔎 Validating proxy: ${proxy.replace(/:[^:@]*@/, ':****@')}`);

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(`❌ Proxy check failed: ${error.message.split('\n')[0]}`);
                return resolve(false);
            }

            const code = parseInt(stdout.trim());
            if (code === 200 || code === 301 || code === 302) {
                console.log('✅ Proxy is ALIVE');
                return resolve(true);
            } else {
                console.warn(`⚠️ Proxy returned status: ${code}`);
                return resolve(false);
            }
        });
    });
};

// Check Proxy & Get Public IP
export const getProxyIP = (proxy) => {
    return new Promise((resolve) => {
        if (!proxy) return resolve(null);

        // curl to fetch IP
        const target = 'https://ipv4.webshare.io/'; // Fast plain text IP service
        const cmd = `curl --proxy "${proxy}" "${target}" --max-time 15 -s`;

        console.log(`🔎 Checking IP for proxy: ${proxy.replace(/:[^:@]*@/, ':****@')}`);

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(`❌ Proxy IP check failed: ${error.message.split('\n')[0]}`);
                return resolve(null);
            }

            const ip = stdout.trim();
            // Basic validation to check if it looks like an IP (roughly)
            if (ip.length > 5 && ip.length < 20 && ip.includes('.')) {
                console.log(`✅ Proxy IP: ${ip}`);
                return resolve(ip);
            } else {
                console.warn(`⚠️ Invalid IP response: ${ip.substring(0, 50)}`);
                return resolve(null);
            }
        });
    });
};

export default {
    getRandomProxy,
    addProxy,
    addProxies,
    getProxyCount,
    checkProxyConnectivity,
    getProxyIP
};
