import { useEffect, useState } from 'react';
import { accountAPI } from '../../services/api';
import { Table, Download, Search, Filter } from 'lucide-react';
import constants from '../../constants';

function AccountsTable() {
    const [accounts, setAccounts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 20,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, [filters]);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const response = await accountAPI.getAccounts(filters);
            if (response.data.success) {
                setAccounts(response.data.accounts);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Failed to load accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await accountAPI.exportCSV({ status: filters.status });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tiktok-accounts-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to export CSV:', err);
        }
    };

    const getStatusBadge = (status) => {
        const colorClass = constants.STATUS_COLORS[status] || 'text-gray-600 bg-gray-50';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Table className="w-6 h-6 text-purple-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Created Accounts</h2>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email or username..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none"
                    >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Password</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DOB</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TikTok ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Info</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profile</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    Loading accounts...
                                </td>
                            </tr>
                        ) : accounts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No accounts found
                                </td>
                            </tr>
                        ) : (
                            accounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm text-gray-900">{account.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                                        {account.email || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                                        {account.password || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {account.username || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {account.date_of_birth || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                                        {account.tiktok_user_id || '-'}
                                    </td>

                                    {/* NEW COLUMNS */}
                                    <td className="px-4 py-3 text-sm text-gray-900 text-xs">
                                        {account.ip_address ? (
                                            <div>
                                                <div className="font-semibold">{account.ip_address}</div>
                                                <div className="text-gray-500 truncate max-w-[150px]" title={account.ip_location}>{account.ip_location}</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-xs">
                                        {account.activity_duration_mins ? `${account.activity_duration_mins} mins` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {account.profile_url ? (
                                            <a href={account.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View
                                            </a>
                                        ) : '-'}
                                    </td>

                                    <td className="px-4 py-3">{getStatusBadge(account.status)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(account.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} accounts
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        <div className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 font-semibold rounded-lg">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>

                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={filters.page === pagination.totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountsTable;
