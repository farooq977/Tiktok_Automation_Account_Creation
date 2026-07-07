
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { getRandomProxy } from './services/proxyService.js';
import * as logger from './utils/logger.js';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDebug() {
    logger.info('🚀 Starting Proxy & Anonymity Debugger...');

    // 1. Get Proxy
    const proxyToUse = getRandomProxy();
    logger.info(`🌐 Selected Proxy: ${proxyToUse}`);

    // 2. Launch Browser (using same Python launcher as main bot)
    logger.info('🐍 Launching Python Browser...');

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'utils/browserLauncher.py'),
            proxyToUse
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
                    pythonProcess.kill(); // Kill after test
                    resolve();
                } catch (e) {
                    logger.error(`Debug failed: ${e.message}`);
                    pythonProcess.kill();
                    reject(e);
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python Error]: ${data}`);
        });
    });
}

async function connectAndDebug(wsEndpoint) {
    logger.info('🔌 Connecting Playwright...');
    const browser = await chromium.connectOverCDP(wsEndpoint);
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    logger.info('🕵️ Running Anonymity Checks...');

    // 1. Check IP, Location, Timezone via ip-api
    try {
        await page.goto('http://ip-api.com/json/', { waitUntil: 'domcontentloaded' });
        const content = await page.innerText('body');
        const ipInfo = JSON.parse(content);
        logger.info('---------------------------------------------------');
        logger.info(`🌍 EXTERNAL IP:   ${ipInfo.query}`);
        logger.info(`📍 LOCATION:      ${ipInfo.country}, ${ipInfo.city}`);
        logger.info(`🕒 IP TIMEZONE:   ${ipInfo.timezone}`);
        logger.info(`🏢 ISP/ORG:       ${ipInfo.isp} / ${ipInfo.org}`);
        logger.info('---------------------------------------------------');

        // Warn if likely datacenter
        const likelyDatacenter = /hosting|datacenter|cloud|server/i.test(ipInfo.isp) || /hosting|datacenter|cloud|server/i.test(ipInfo.org);
        if (likelyDatacenter) {
            logger.warning('⚠️  WARNING: ISP name suggests Datacenter/Hosting IP (High Detection Risk)');
        } else {
            logger.success('✅ ISP looks Residential/Commercial');
        }

    } catch (e) {
        logger.error('Failed to fetch IP info: ' + e.message);
    }

    // 2. Check Browser Fingerprint (Bot Detection)
    logger.info('🤖 Checking Automation Flags (sannysoft)...');
    try {
        await page.goto('https://bot.sannysoft.com/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Extract table results
        const results = await page.evaluate(() => {
            const table = {};
            document.querySelectorAll('table tr').forEach(tr => {
                const key = tr.querySelector('td:first-child')?.innerText;
                const val = tr.querySelector('td:last-child')?.innerText;
                if (key) table[key] = val;
            });
            return table;
        });

        logger.info('---------------------------------------------------');
        logger.info(`🕷️  User Agent:    ${results['User Agent']}`);
        logger.info(`🕷️  WebDriver:     ${results['WebDriver']}`); // Should be 'missing'
        logger.info(`🕷️  Chrome:        ${results['Chrome']}`);    // Should be 'present'
        logger.info(`🕷️  Permissions:   ${results['Permissions']}`);
        logger.info(`🕷️  Plugins Length:${results['Plugins length']}`);
        logger.info(`🕷️  WebGL Vendor:  ${results['WebGL Vendor']}`);
        logger.info('---------------------------------------------------');

        if (results['WebDriver'] && results['WebDriver'].includes('present')) {
            logger.error('❌ CRITICAL: WebDriver detected! Stealth mode failed.');
        } else {
            logger.success('✅ WebDriver not detected (Stealth working)');
        }

    } catch (e) {
        logger.error('Failed to check bot flags: ' + e.message);
    }

    logger.info('✅ Debug run complete.');
    await browser.close();
}

runDebug().catch(console.error);
