import React, { useState, useEffect } from 'react';
import { Clock, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsService } from '../services/api';

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await analyticsService.getStockTrends(7);
      const trends = response.data.data || [];
      
      // Convert trends to activity format
      const activityData = trends.slice(0, 10).map((trend, index) => ({
        id: index,
        type: trend.movement_type,
        description: `${trend.movement_type} movement: ${trend.total_quantity} items`,
        time: new Date(trend.date).toLocaleDateString(),
        count: trend.movement_count
      }));
      
      setActivities(activityData);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Mock data for demonstration
      setActivities([
        {
          id: 1,
          type: 'IN',
          description: 'Stock received: 50 Wireless Mice',
          time: '2 hours ago',
          count: 1
        },
        {
          id: 2,
          type: 'OUT',
          description: 'Stock movement: 25 Office Chairs',
          time: '4 hours ago',
          count: 1
        },
        {
          id: 3,
          type: 'ADJUSTMENT',
          description: 'Stock adjustment: USB Cables',
          time: '1 day ago',
          count: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-center h-32">
            <div className="spinner"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {activity.count}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;