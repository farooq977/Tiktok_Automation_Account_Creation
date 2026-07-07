import { useState } from 'react';
import { batchAPI } from '../../services/api';
import { PlayCircle, Plus } from 'lucide-react';
import constants from '../../constants';

function BatchCreator({ onBatchCreated }) {
    const [batchSize, setBatchSize] = useState(null);
    const [customSize, setCustomSize] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateBatch = async () => {
        setError('');

        const size = batchSize === 'custom' ? parseInt(customSize) : batchSize;

        if (!size || size < 1 || size > 500) {
            setError('Please enter a valid batch size (1-500)');
            return;
        }

        setLoading(true);

        try {
            const response = await batchAPI.createBatch(size);

            if (response.data.success) {
                setBatchSize(null);
                setCustomSize('');
                if (onBatchCreated) {
                    onBatchCreated(response.data.batch);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
                <PlayCircle className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
            </div>

            <p className="text-gray-600 mb-6">
                Select how many TikTok accounts you want to create
            </p>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {constants.BATCH_SIZES.map((size) => (
                    <button
                        key={size}
                        onClick={() => setBatchSize(size)}
                        className={`py-4 px-6 rounded-lg border-2 font-semibold transition ${batchSize === size
                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                : 'border-gray-300 hover:border-purple-400'
                            }`}
                    >
                        {size} Accounts
                    </button>
                ))}

                <button
                    onClick={() => setBatchSize('custom')}
                    className={`py-4 px-6 rounded-lg border-2 font-semibold transition flex items-center justify-center ${batchSize === 'custom'
                            ? 'border-purple-600 bg-purple-50 text-purple-600'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Custom
                </button>
            </div>

            {batchSize === 'custom' && (
                <div className="mb-6">
                    <label htmlFor="customSize" className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Batch Size (1-500)
                    </label>
                    <input
                        id="customSize"
                        type="number"
                        min="1"
                        max="500"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="Enter custom batch size"
                    />
                </div>
            )}

            <button
                onClick={handleCreateBatch}
                disabled={!batchSize || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
                {loading ? 'Creating Batch...' : 'Start Account Creation'}
            </button>

            <p className="mt-4 text-sm text-gray-500 text-center">
                ⏱️ Note: Accounts are created with 5-10 minute delays to avoid detection
            </p>
        </div>
    );
}

export default BatchCreator;
