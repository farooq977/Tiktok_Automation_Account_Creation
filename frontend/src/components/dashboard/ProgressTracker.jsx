import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

function ProgressTracker({ batchId }) {
    const [progress, setProgress] = useState(null);
    const [eventSource, setEventSource] = useState(null);

    useEffect(() => {
        if (!batchId) return;

        const token = localStorage.getItem('token');
        const url = `http://localhost:5000/api/accounts/progress/${batchId}`;

        const es = new EventSource(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data);
        };

        es.onerror = () => {
            es.close();
        };

        setEventSource(es);

        return () => {
            if (es) es.close();
        };
    }, [batchId]);

    if (!progress) return null;

    const percentage = progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 text-blue-600 mr-2 animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900">Live Progress</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Creating accounts...</span>
                        <span>{progress.completed} / {progress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{progress.success}</div>
                        <div className="text-sm text-gray-600">Success</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">{progress.failed}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{progress.pending}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </div>
                </div>

                {percentage === 100 && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-center font-medium">
                        🎉 Batch completed!
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProgressTracker;
