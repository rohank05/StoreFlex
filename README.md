# StoreFlex - Inventory Management System

A comprehensive inventory management system built with React (Vite), Node.js 21, and PostgreSQL. Features include product CRUD operations, CSV/Excel import functionality, analytics dashboard, and real-time stock tracking.

## 🚀 Features

- **Product Management**: Complete CRUD operations for inventory items
- **Import/Export**: CSV and Excel file import with error handling and validation
- **Analytics Dashboard**: Real-time insights with charts and performance metrics
- **Stock Management**: Track stock levels, movements, and low-stock alerts
- **Category Management**: Organize products by categories
- **Responsive Design**: Modern UI that works on all devices
- **Docker Support**: Easy deployment with Docker Compose

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Recharts** - Data visualization and charts
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js 21** - Latest Node.js runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **Joi** - Data validation
- **Multer** - File upload handling
- **CSV Parser** - CSV file processing
- **XLSX** - Excel file processing

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- **Node.js 21+**
- **PostgreSQL 15+**
- **Docker & Docker Compose** (for containerized deployment)

## 🏃‍♂️ Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohank05/StoreFlex.git
   cd StoreFlex
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Complete App (via Nginx): http://localhost:80

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL** (make sure it's running on port 5432)

5. **Start the backend server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update product stock
- `GET /api/products/low-stock` - Get low stock products

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/stock-trends` - Get stock movement trends
- `GET /api/analytics/import-stats` - Get import statistics

### Import
- `POST /api/import/upload` - Upload CSV/Excel file
- `GET /api/import/history` - Get import history
- `GET /api/import/template` - Download import template

## 📁 Project Structure

```
StoreFlex/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── nginx.conf             # Nginx configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storeflex
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

## 📤 Import/Export

### Import Format
The system supports CSV and Excel files with the following columns:

**Required:**
- `name` - Product name
- `sku` - Stock Keeping Unit (unique identifier)

**Optional:**
- `description` - Product description
- `category` - Category name (auto-created if doesn't exist)
- `supplier` - Supplier name (auto-created if doesn't exist)
- `unit_price` - Selling price
- `cost_price` - Cost price
- `quantity` - Stock quantity
- `min_stock` - Minimum stock level
- `max_stock` - Maximum stock level
- `barcode` - Product barcode
- `location` - Storage location
- `status` - active/inactive

### Download Template
Use the "Download Template" button in the Import page to get a properly formatted Excel template.

## 🐳 Docker Deployment

### Services
- **database**: PostgreSQL 15 with persistent volume
- **backend**: Node.js API server
- **frontend**: React app served with Nginx
- **nginx**: Reverse proxy for routing

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## 📈 Features Overview

### Dashboard
- Real-time inventory statistics
- Stock level charts
- Category distribution
- Top products by value
- Recent activity feed

### Product Management
- Add, edit, delete products
- Stock level tracking
- Category assignment
- Price management
- Status control

### Analytics
- Stock movement trends
- Category performance
- Import statistics
- Low stock alerts

### Import System
- Drag & drop file upload
- CSV and Excel support
- Validation and error reporting
- Import history tracking
- Bulk product updates

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 🔒 Security Features

- Input validation with Joi
- SQL injection prevention
- CORS configuration
- Helmet.js security headers
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and Vite teams for excellent development tools
- PostgreSQL for robust database capabilities
- All open-source contributors whose libraries made this project possible

## 📞 Support

For support, email admin@storeflex.com or create an issue in this repository.