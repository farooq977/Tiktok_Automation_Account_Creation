// Random delay between min and max milliseconds
export const randomDelay = async (minMs = 1000, maxMs = 5000) => {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await sleep(delay);
};

// Type text with human-like speed
export const humanType = async (page, selector, text, minDelay = 50, maxDelay = 150) => {
    await page.click(selector);
    await randomDelay(300, 800); // Pause before typing

    for (const char of text) {
        await page.type(selector, char, {
            delay: Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay,
        });
    }

    await randomDelay(500, 1200); // Pause after typing
};

// Move mouse to element before clicking
export const humanClick = async (page, selectorOrElement) => {
    let element;
    if (typeof selectorOrElement === 'string') {
        element = await page.$(selectorOrElement);
    } else {
        element = selectorOrElement;
    }

    if (!element) {
        throw new Error(`Element not found: ${selectorOrElement}`);
    }

    // Get element position
    const box = await element.boundingBox();

    if (box) {
        // Target center with small random offset
        const x = box.x + box.width / 2 + (Math.random() - 0.5) * 5;
        const y = box.y + box.height / 2 + (Math.random() - 0.5) * 5;

        // Move mouse (even on mobile, "pointer" moves exist)
        try {
            await page.mouse.move(x, y, { steps: 5 + Math.floor(Math.random() * 10) });
        } catch (e) { }

        await randomDelay(100, 300);

        // Try TOUCH TAP first (Best for Mobile Mode)
        try {
            if (page.touchscreen) {
                await page.touchscreen.tap(x, y);
            } else {
                await element.click();
            }
        } catch (e) {
            // Fallback to standard click
            await element.click();
        }
    } else {
        // Fallback if no bounding box
        await element.click();
    }

    await randomDelay(500, 1500);
};

// Random scroll on page
export const randomScroll = async (page) => {
    const scrollAmount = Math.floor(Math.random() * 300) + 100;
    await page.evaluate((amount) => {
        window.scrollBy(0, amount);
    }, scrollAmount);
    await randomDelay(500, 1500);
};

// Move mouse randomly on page
export const randomMouseMovement = async (page) => {
    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 600) + 100;

    await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 20) });
    await randomDelay(300, 800);
};

// Generate random date of birth (18-50 years old)
export const generateDateOfBirth = () => {
    const today = new Date();
    const minAge = 18;
    const maxAge = 50;

    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const birthYear = today.getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Safe for all months

    const month = birthMonth.toString().padStart(2, '0');
    const day = birthDay.toString().padStart(2, '0');

    return {
        year: birthYear,
        month: month,
        day: day,
        formatted: `${birthYear}-${month}-${day}`,
    };
};

// Helper sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    randomDelay,
    humanType,
    humanClick,
    randomScroll,
    randomMouseMovement,
    generateDateOfBirth,
};
