import { useEffect, useState } from 'react';
import { accountAPI } from '../../services/api';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatsCards() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const response = await accountAPI.getStats();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Total Accounts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Success</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.success}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Failed</p>
                        <p className="text-3xl font-bold text-red-600 mt-1">{stats.failed}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.successRate}%</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsCards;
