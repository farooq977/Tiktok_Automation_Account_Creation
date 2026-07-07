import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, `bot-${new Date().toISOString().split('T')[0]}.log`);

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log levels
const LogLevel = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};

// Log message to file and console
export const log = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    // Console output with colors
    const consoleMessage = data
        ? `${logMessage}\n${JSON.stringify(data, null, 2)}`
        : logMessage;

    switch (level) {
        case LogLevel.INFO:
            console.log(`ℹ️  ${consoleMessage}`);
            break;
        case LogLevel.SUCCESS:
            console.log(`✅ ${consoleMessage}`);
            break;
        case LogLevel.WARNING:
            console.warn(`⚠️  ${consoleMessage}`);
            break;
        case LogLevel.ERROR:
            console.error(`❌ ${consoleMessage}`);
            break;
    }

    // Write to file
    const fileMessage = data
        ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n`
        : `${logMessage}\n`;

    fs.appendFileSync(LOG_FILE, fileMessage);
};

export const info = (message, data) => log(LogLevel.INFO, message, data);
export const success = (message, data) => log(LogLevel.SUCCESS, message, data);
export const warning = (message, data) => log(LogLevel.WARNING, message, data);
export const error = (message, data) => log(LogLevel.ERROR, message, data);

export default {
    log,
    info,
    success,
    warning,
    error,
};
