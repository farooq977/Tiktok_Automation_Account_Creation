import axios from 'axios';

const CAPSOLVER_API_KEY = process.env.CAPSOLVER_API_KEY;
const CAPSOLVER_API_URL = 'https://api.capsolver.com/createTask';
const CAPSOLVER_RESULT_URL = 'https://api.capsolver.com/getTaskResult';

// Solve reCAPTCHA or other CAPTCHAs
export const solveCaptcha = async (websiteURL, websiteKey, captchaType = 'ReCaptchaV2TaskProxyLess') => {
    try {
        if (!CAPSOLVER_API_KEY) {
            console.warn('⚠️  CapSolver API key not configured - skipping CAPTCHA');
            return null;
        }

        console.log('🔐 Detected CAPTCHA - sending to CapSolver...');

        // Create task
        const createTaskResponse = await axios.post(CAPSOLVER_API_URL, {
            clientKey: CAPSOLVER_API_KEY,
            task: {
                type: captchaType,
                websiteURL,
                websiteKey,
            },
        });

        if (createTaskResponse.data.errorId !== 0) {
            throw new Error(`CapSolver error: ${createTaskResponse.data.errorDescription}`);
        }

        const taskId = createTaskResponse.data.taskId;
        console.log(`📝 CAPTCHA task created: ${taskId}`);

        // Poll for result (max 2 minutes)
        for (let i = 0; i < 24; i++) {
            await sleep(5000); // Wait 5 seconds

            const resultResponse = await axios.post(CAPSOLVER_RESULT_URL, {
                clientKey: CAPSOLVER_API_KEY,
                taskId,
            });

            if (resultResponse.data.status === 'ready') {
                console.log('✅ CAPTCHA solved successfully');
                return resultResponse.data.solution.gRecaptchaResponse;
            }

            if (resultResponse.data.errorId !== 0) {
                throw new Error(`CapSolver error: ${resultResponse.data.errorDescription}`);
            }

            console.log(`⏳ Waiting for CAPTCHA solution... (${i + 1}/24)`);
        }

        throw new Error('CAPTCHA solving timeout');
    } catch (error) {
        console.error('CAPTCHA solving failed:', error.message);
        throw error;
    }
};

// Detect CAPTCHA on page
export const detectCaptcha = async (page) => {
    try {
        // Check for common CAPTCHA elements
        const captchaSelectors = [
            'iframe[src*="recaptcha"]',
            'iframe[src*="hcaptcha"]',
            '[class*="captcha"]',
            '[id*="captcha"]',
            '.captcha-box',
            '#captcha-verify',
        ];

        for (const selector of captchaSelectors) {
            const element = await page.$(selector);
            if (element) {
                console.log(`🔍 CAPTCHA detected: ${selector}`);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('CAPTCHA detection error:', error.message);
        return false;
    }
};

// Helper sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    solveCaptcha,
    detectCaptcha,
};
