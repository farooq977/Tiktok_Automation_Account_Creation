import axios from 'axios';

// 1secmail API (Free & Reliable for OTPs)
const SEC_MAIL_API = 'https://www.1secmail.com/api/v1/';

// Random User Agents to avoid 403 blocks
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// mail.tm API
const MAIL_TM_API = 'https://api.mail.tm';

let currentEmail = null;
let currentToken = null;
let accountId = null;

// Generate random email using mail.tm
export const generateEmail = async () => {
    try {
        console.log(`📧 Generating temp email via mail.tm...`);

        // Get available domains
        const domainsResponse = await axios.get(`${MAIL_TM_API}/domains`);
        const domains = domainsResponse.data['hydra:member'];
        console.log(`ℹ️ Available domains: ${domains.length}`);


        if (!domains || domains.length === 0) {
            throw new Error('No domains available from mail.tm');
        }

        // UPDATED: Randomly select a domain instead of always using the first
        const domain = domains[Math.floor(Math.random() * domains.length)].domain;
        console.log(`🌐 Using domain: ${domain}`);

        // Generate random credentials
        const randomString = Math.random().toString(36).substring(2, 10);
        const username = `tiktok${randomString}`;
        const email = `${username}@${domain}`;
        const password = Math.random().toString(36).substring(2, 15);

        // Create account
        const createResponse = await axios.post(`${MAIL_TM_API}/accounts`, {
            address: email,
            password: password
        });

        accountId = createResponse.data.id;

        // Get authentication token
        const tokenResponse = await axios.post(`${MAIL_TM_API}/token`, {
            address: email,
            password: password
        });

        currentToken = tokenResponse.data.token;
        currentEmail = email;

        console.log(`✅ Generated temp email: ${email}`);
        return email;

    } catch (error) {
        if (error.response && error.response.status === 429) {
            const jitter = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
            console.warn(`⚠️ mail.tm Rate Limited (429). Retrying in ${jitter / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, jitter));
            return generateEmail(); // Recursive retry
        }
        console.error('❌ mail.tm generation failed:', error.message);
        throw error;
    }
};

// Get verification code from email with infinite waiting (until timeout)
export const getVerificationCode = async (email, maxAttempts = 120) => { // 120 * 5s = 10 mins wait
    try {
        if (!currentToken) {
            throw new Error('No authentication token - cannot fetch emails');
        }

        console.log(`📬 Waiting for verification code for ${email}...`);
        console.log(`⏳ Checking inbox every 5 seconds...`);

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Sleep 5s

            try {
                // Get messages with authentication
                const response = await axios.get(`${MAIL_TM_API}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });

                const messages = response.data['hydra:member'];

                if (messages && messages.length > 0) {
                    console.log(`📨 Found ${messages.length} message(s) in inbox`);

                    // Find TikTok email
                    const tiktokEmail = messages.find(msg =>
                        (msg.from.address && msg.from.address.toLowerCase().includes('tiktok')) ||
                        (msg.subject && msg.subject.toLowerCase().includes('verification')) ||
                        (msg.subject && msg.subject.toLowerCase().includes('code'))
                    );

                    if (tiktokEmail) {
                        console.log(`✅ Found TikTok email: "${tiktokEmail.subject}"`);

                        // Get full message content
                        const messageResponse = await axios.get(`${MAIL_TM_API}/messages/${tiktokEmail.id}`, {
                            headers: {
                                'Authorization': `Bearer ${currentToken}`
                            }
                        });

                        const messageData = messageResponse.data;

                        // Combine subject, text, and html to search everywhere
                        // Ensure everything is a string to avoid "match is not a function" error
                        const subject = tiktokEmail.subject || '';
                        const text = (typeof messageData.text === 'string') ? messageData.text : '';
                        const html = (typeof messageData.html === 'string') ? messageData.html : '';

                        const content = `${subject} ${text} ${html}`;

                        // Extract 6-digit code
                        const codeMatches = content.match(/\b\d{6}\b/);
                        // Fallback for 4-8 digits
                        const anyNumberMatches = content.match(/\b\d{4,8}\b/);

                        const code = codeMatches ? codeMatches[0] : (anyNumberMatches ? anyNumberMatches[0] : null);

                        if (code) {
                            console.log(`✅ Verification code extracted: ${code}`);
                            return code;
                        }
                    }
                }

                if (i % 6 === 0) console.log(`⏳ Still waiting for code... (Attempt ${i + 1}/${maxAttempts})`);

            } catch (fetchErr) {
                console.error(`Fetch error: ${fetchErr.message}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        throw new Error('Verification code not received within timeout period');

    } catch (error) {
        console.error('❌ Failed to get verification code:', error.message);
        throw error;
    }
};

export const cleanupEmail = async () => {
    try {
        if (currentToken && accountId) {
            await axios.delete(`${MAIL_TM_API}/accounts/${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            console.log('🗑️  Temp email account deleted');
        }
    } catch (error) {
        // Ignore cleanup errors
    }
};

export default {
    generateEmail,
    getVerificationCode,
    cleanupEmail,
};
