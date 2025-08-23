import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Upload, 
  Menu, 
  X,
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Import', href: '/import', icon: Upload },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">StoreFlex</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-semibold text-white">A</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@storeflex.com</p>
            </div>
            <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-2xl font-bold text-gray-900 lg:ml-0">
                {navigation.find(nav => nav.href === location.pathname)?.name || 'StoreFlex'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden sm:block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;