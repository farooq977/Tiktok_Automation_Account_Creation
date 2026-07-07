export default {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    BATCH_SIZES: [10, 20, 50, 100],

    STATUS_COLORS: {
        success: 'text-green-600 bg-green-50',
        failed: 'text-red-600 bg-red-50',
        pending: 'text-yellow-600 bg-yellow-50',
        processing: 'text-blue-600 bg-blue-50',
        completed: 'text-purple-600 bg-purple-50',
    },
};
