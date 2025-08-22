import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { analyticsService } from '../services/api';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function Analytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [stockTrends, setStockTrends] = useState([]);
  const [importStats, setImportStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, trendsResponse, importResponse] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getStockTrends(selectedPeriod),
        analyticsService.getImportStats()
      ]);

      setDashboardData(dashboardResponse.data.data);
      setStockTrends(trendsResponse.data.data || []);
      setImportStats(importResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStockTrends = () => {
    if (!stockTrends.length) return [];

    const trendMap = {};
    stockTrends.forEach(trend => {
      const date = new Date(trend.date).toLocaleDateString();
      if (!trendMap[date]) {
        trendMap[date] = { date, IN: 0, OUT: 0, ADJUSTMENT: 0 };
      }
      trendMap[date][trend.movement_type] = trend.total_quantity;
    });

    return Object.values(trendMap).slice(-14); // Last 14 days
  };

  const processCategoryData = () => {
    if (!dashboardData?.categoryDistribution) return [];
    
    return dashboardData.categoryDistribution.map((category, index) => ({
      name: category.name,
      value: category.product_count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const processImportData = () => {
    if (!importStats.length) return [];
    
    return importStats.map(stat => ({
      month: new Date(stat.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      imports: stat.import_count,
      success: stat.successful_rows,
      failed: stat.failed_rows
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const stockTrendData = processStockTrends();
  const categoryData = processCategoryData();
  const importData = processImportData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Inventory insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="form-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn btn-outline">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.overview?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(dashboardData?.overview?.totalInventoryValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.overview?.lowStockProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.overview?.totalCategories || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Stock Movement Trends</h3>
            <p className="text-sm text-gray-600">Daily stock movements over time</p>
          </div>
          <div className="card-body">
            {stockTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="IN" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Stock In"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="OUT" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="Stock Out"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ADJUSTMENT" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    name="Adjustments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No stock movement data available
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
            <p className="text-sm text-gray-600">Products by category</p>
          </div>
          <div className="card-body">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Import Statistics</h3>
          <p className="text-sm text-gray-600">Monthly import activity and success rates</p>
        </div>
        <div className="card-body">
          {importData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={importData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="imports" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Imports"
                />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Successful Rows"
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Failed Rows"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No import data available
            </div>
          )}
        </div>
      </div>

      {/* Performance Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Total Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.topProducts?.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">{product.category_name}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.quantity_in_stock > 50 ? 'badge-success' : 
                        product.quantity_in_stock > 10 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {product.quantity_in_stock}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium">${(product.total_value || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No product data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;