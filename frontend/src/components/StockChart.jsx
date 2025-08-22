import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No stock data available
      </div>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    stock: item.quantity_in_stock,
    minStock: item.min_stock_level,
    status: item.stock_status
  }));

  const getBarColor = (status) => {
    switch (status) {
      case 'Low': return '#ef4444';
      case 'High': return '#10b981';
      default: return '#3b82f6';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [value, name === 'stock' ? 'Current Stock' : 'Min Stock']}
          labelFormatter={(label) => `Product: ${label}`}
        />
        <Bar 
          dataKey="stock" 
          fill="#3b82f6"
          name="Current Stock"
        />
        <Bar 
          dataKey="minStock" 
          fill="#e5e7eb"
          name="Min Stock"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StockChart;