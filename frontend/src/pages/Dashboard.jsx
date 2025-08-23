import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { analyticsService } from '../services/api';
import StockChart from '../components/StockChart';
import RecentActivity from '../components/RecentActivity';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboard();
      setDashboardData(response.data.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="spinner"></div>
        <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-semibold text-red-800">Connection Error</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
              <p className="text-xs text-red-600 mt-2">Please check if the backend server is running.</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 btn btn-outline text-red-700 border-red-300 hover:bg-red-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Products',
      value: dashboardData?.overview?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Value',
      value: `$${(dashboardData?.overview?.totalInventoryValue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      name: 'Low Stock Items',
      value: dashboardData?.overview?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '-2',
      changeType: 'decrease'
    },
    {
      name: 'Recent Movements',
      value: dashboardData?.overview?.recentMovements || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+15',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card group">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stat.changeType === 'increase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
          </div>
          <div className="card-body">
            <StockChart data={dashboardData?.stockLevels} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {dashboardData?.categoryDistribution?.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][index]
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{category.product_count}</div>
                    <div className="text-xs text-gray-500">
                      ${(category.category_value || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Value */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Products by Value</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          product.quantity_in_stock > 50 ? 'badge-success' : 
                          product.quantity_in_stock > 10 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {product.quantity_in_stock}
                        </span>
                      </td>
                      <td className="font-medium">${(product.total_value || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}

export default Dashboard;