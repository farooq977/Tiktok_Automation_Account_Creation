
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { getRandomProxy } from './services/proxyService.js';
import * as logger from './utils/logger.js';
import { chromium } from 'playwright';
import ProxyChain from 'proxy-chain';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDebug() {
    logger.info('🚀 Starting ProxyChain Debugger...');

    // 1. Get Upstream Proxy
    const upstreamProxyUrl = getRandomProxy(); // http://user:pass@host:port
    logger.info(`🌐 Upstream Proxy: ${upstreamProxyUrl}`);

    // 2. Start Local Proxy Server
    const server = new ProxyChain.Server({
        port: 0, // Random port
        verbose: false,
        prepareRequestFunction: ({ request }) => {
            return {
                requestAuthentication: false,
                upstreamProxyUrl: upstreamProxyUrl
            };
        },
    });

    await server.listen();
    const localProxyUrl = `http://127.0.0.1:${server.port}`;
    logger.success(`✅ Local Proxy Started: ${localProxyUrl} -> Forwards to Upstream`);

    // 3. Launch Browser pointing to LOCAL Proxy (No Auth needed)
    logger.info('🐍 Launching Python Browser with Local Proxy...');

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'utils/browserLauncher.py'),
            localProxyUrl
        ]);

        let wsEndpoint = null;

        pythonProcess.stdout.on('data', async (data) => {
            const output = data.toString().trim();
            console.log(`[Python]: ${output}`);

            if (output.includes('CDP_ENDPOINT:')) {
                wsEndpoint = output.split('CDP_ENDPOINT:')[1].trim();
                logger.success(`✅ WebSocket Endpoint: ${wsEndpoint}`);

                try {
                    await connectAndDebug(wsEndpoint);
                    pythonProcess.kill();
                    await server.close(true);
                    resolve();
                } catch (e) {
                    logger.error(`Debug failed: ${e.message}`);
                    pythonProcess.kill();
                    await server.close(true);
                    reject(e);
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            // Ignore benign ssl warnings
            if (!data.toString().includes('UserWarning'))
                console.error(`[Python Error]: ${data}`);
        });
    });
}

async function connectAndDebug(wsEndpoint) {
    logger.info('🔌 Connecting Playwright...');
    const browser = await chromium.connectOverCDP(wsEndpoint);
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    logger.info('🕵️ Running Anonymity Checks (Via ProxyChain)...');

    try {
        logger.info('📱 Navigating to TikTok (HTTPS)...');
        // Increase timeout to 60s
        await page.goto('https://www.tiktok.com/signup', { waitUntil: 'domcontentloaded', timeout: 60000 });

        logger.success('✅ TikTok Navigation Started (No immediate error)');
        await page.waitForTimeout(5000); // Wait for render

        const title = await page.title();
        logger.info(`📄 Page Title: ${title}`);

        // Screenshot
        const screenshotPath = path.join(__dirname, 'tiktok_debug.png');
        await page.screenshot({ path: screenshotPath });
        logger.info(`📸 Screenshot saved to: ${screenshotPath}`);

    } catch (e) {
        logger.error('❌ Failed to load TikTok: ' + e.message);
        try {
            const screenshotPath = path.join(__dirname, 'tiktok_error.png');
            await page.screenshot({ path: screenshotPath });
            logger.info(`📸 Error Screenshot saved: ${screenshotPath}`);
        } catch { }
    }

    await browser.close();
}

runDebug().catch(console.error);
