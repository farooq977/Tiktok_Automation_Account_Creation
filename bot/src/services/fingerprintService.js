// Comprehensive browser fingerprinting service
// Generates unique fingerprints for each browser session

// Random window sizes (realistic desktop resolutions)
const windowSizes = [
    { width: 1920, height: 1080, name: 'Full HD' },
    { width: 1366, height: 768, name: 'HD' },
    { width: 1536, height: 864, name: 'HD+' },
    { width: 1440, height: 900, name: 'WXGA+' },
    { width: 1600, height: 900, name: 'HD+ Wide' },
    { width: 2560, height: 1440, name: '2K' },
    { width: 1280, height: 720, name: 'HD Ready' },
    { width: 1680, height: 1050, name: 'WSXGA+' },
];

// Operating Systems with realistic distributions
const operatingSystems = [
    { name: 'Windows 10', platform: 'Win32', version: '10.0' },
    { name: 'Windows 11', platform: 'Win32', version: '11.0' },
    { name: 'macOS Sonoma', platform: 'MacIntel', version: '14.0' },
    { name: 'macOS Ventura', platform: 'MacIntel', version: '13.0' },
    { name: 'macOS Monterey', platform: 'MacIntel', version: '12.0' },
];

// Chrome versions (recent)
const chromeVersions = [
    '120.0.6099.129',
    '120.0.6099.130',
    '121.0.6167.85',
    '121.0.6167.139',
    '122.0.6261.94',
    '122.0.6261.112',
];

// Timezones based on common locations
const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
];

// Languages
const languages = [
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['en-CA', 'en', 'fr-CA'],
    ['de-DE', 'de', 'en'],
    ['fr-FR', 'fr', 'en'],
    ['es-ES', 'es', 'en'],
];

// WebGL vendors and renderers (realistic combinations)
const webGLConfigs = [
    { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)' },
    { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0)' },
    { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, Radeon RX 5700 Direct3D11 vs_5_0 ps_5_0)' },
    { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)' },
    { vendor: 'Intel Inc.', renderer: 'Intel Iris OpenGL Engine' },
    { vendor: 'Apple Inc.', renderer: 'Apple M1' },
];

// Generate a complete fingerprint
export const generateFingerprint = () => {
    const windowSize = windowSizes[Math.floor(Math.random() * windowSizes.length)];
    const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
    const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
    const timezone = timezones[Math.floor(Math.random() * timezones.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    const webgl = webGLConfigs[Math.floor(Math.random() * webGLConfigs.length)];

    // Generate user agent based on OS
    let userAgent;
    if (os.platform === 'Win32') {
        userAgent = `Mozilla/5.0 (Windows NT ${os.version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    } else {
        const macVersion = os.version.replace('.', '_');
        userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X ${macVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
    }

    // Random hardware concurrency (CPU cores)
    const hardwareConcurrency = [4, 8, 12, 16][Math.floor(Math.random() * 4)];

    // Random device memory (in GB)
    const deviceMemory = [4, 8, 16, 32][Math.floor(Math.random() * 4)];

    // Random screen color depth
    const colorDepth = [24, 30][Math.floor(Math.random() * 2)];

    const fingerprint = {
        // Window
        window: {
            width: windowSize.width,
            height: windowSize.height,
            name: windowSize.name,
            outerWidth: windowSize.width,
            outerHeight: windowSize.height + Math.floor(Math.random() * 50) + 100, // Add chrome UI height
        },

        // Screen
        screen: {
            width: windowSize.width,
            height: windowSize.height,
            availWidth: windowSize.width,
            availHeight: windowSize.height - Math.floor(Math.random() * 40) - 40, // Subtract taskbar
            colorDepth: colorDepth,
            pixelDepth: colorDepth,
        },

        // Navigator
        navigator: {
            userAgent: userAgent,
            platform: os.platform,
            language: language[0],
            languages: language,
            hardwareConcurrency: hardwareConcurrency,
            deviceMemory: deviceMemory,
            vendor: 'Google Inc.',
            vendorSub: '',
        },

        // WebGL
        webgl: webgl,

        // Timezone
        timezone: timezone,

        // OS Info
        os: os,

        // Chrome Version
        chromeVersion: chromeVersion,
    };

    return fingerprint;
};

// Get random element from array
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
    generateFingerprint,
};
