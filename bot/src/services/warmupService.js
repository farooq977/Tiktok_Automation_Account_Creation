import { randomDelay, randomScroll, randomMouseMovement, humanClick } from '../utils/humanBehavior.js';
import * as logger from '../utils/logger.js';

export const warmUpAccount = async (page) => {
    logger.info('🔥 Starting Account Warm-up Phase...');

    try {
        // 1. Wait for "For You" page feed to load
        await page.waitForLoadState('networkidle').catch(() => { });
        await randomDelay(3000, 5000);

        const actions = Math.floor(Math.random() * 5) + 3; // Perform 3-8 scroll actions
        logger.info(`🔥 Will perform ${actions} scroll/watch actions`);

        for (let i = 0; i < actions; i++) {
            logger.info(`Action ${i + 1}/${actions}: Watching video...`);

            // Watch video for random time (5s - 15s)
            await randomDelay(5000, 15000);

            // Randomly Like (30% chance)
            if (Math.random() > 0.7) {
                logger.info('❤️ Randomly liking video...');
                try {
                    // Try multiple generic selectors for the Like button
                    const likeSelectors = [
                        '[data-e2e="like-icon"]',
                        'span[data-e2e="like-icon"]',
                        'button[aria-label="Like video"]'
                    ];

                    for (const sel of likeSelectors) {
                        if (await page.isVisible(sel)) {
                            await humanClick(page, sel);
                            await randomDelay(500, 1000);
                            break;
                        }
                    }
                } catch (e) {
                    logger.warning('Failed to like video: ' + e.message);
                }
            }

            // Scroll to next video
            logger.info('⬇️ Scrolling to next video...');
            await page.keyboard.press('ArrowDown');
            await randomDelay(2000, 4000);
        }

        logger.success('✅ Account Warm-up Completed!');

    } catch (error) {
        logger.error(`❌ Warm-up failed: ${error.message}`);
    }
};
