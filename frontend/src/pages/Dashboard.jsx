import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import StatsCards from '../components/dashboard/StatsCards';
import BatchCreator from '../components/dashboard/BatchCreator';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import AccountsTable from '../components/dashboard/AccountsTable';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeBatchId, setActiveBatchId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBatchCreated = (batch) => {
        setActiveBatchId(batch.id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">TikTok Automation</h1>
                                <p className="text-sm text-gray-600">Account Creation Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                                <User className="w-5 h-5 text-gray-600 mr-2" />
                                <span className="text-gray-900 font-medium">{user?.username || 'User'}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <StatsCards />

                <BatchCreator onBatchCreated={handleBatchCreated} />

                {activeBatchId && <ProgressTracker batchId={activeBatchId} />}

                <AccountsTable />
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 text-center text-gray-600 text-sm">
                <p>⚠️ For educational purposes only. Automated account creation violates TikTok's Terms of Service.</p>
            </footer>
        </div>
    );
}

export default Dashboard;
