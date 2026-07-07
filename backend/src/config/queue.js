import Queue from 'bull';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create Bull queue for account creation jobs
export const accountQueue = new Queue('account-creation', REDIS_URL, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 60000, // 1 minute
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200, // Keep last 200 failed jobs
    },
});

// Redis client for pub/sub (real-time updates)
export const redisClient = createClient({
    url: REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
});

// Connect Redis client
export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        throw error;
    }
};

// Queue event listeners
accountQueue.on('error', (error) => {
    console.error('❌ Queue error:', error);
});

accountQueue.on('waiting', (jobId) => {
    console.log(`⏳ Job ${jobId} is waiting`);
});

accountQueue.on('active', (job) => {
    console.log(`▶️  Job ${job.id} started processing`);
});

accountQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

accountQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

export default { accountQueue, redisClient, connectRedis };
