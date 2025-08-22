import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Package
} from 'lucide-react';
import { productService, categoryService } from '../services/api';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import StockUpdateModal from '../components/StockUpdateModal';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory) filters.category_id = selectedCategory;
      if (selectedStatus) filters.status = selectedStatus;

      const response = await productService.getAll(filters);
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setShowProductModal(true);
  };

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.delete(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleProductSaved = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleStockUpdated = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const getStockStatus = (product) => {
    if (product.quantity_in_stock <= product.min_stock_level) {
      return { status: 'Low', color: 'badge-danger' };
    } else if (product.quantity_in_stock >= product.max_stock_level) {
      return { status: 'High', color: 'badge-warning' };
    }
    return { status: 'Normal', color: 'badge-success' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your inventory products</p>
        </div>
        <button
          onClick={handleCreateProduct}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-gray-900">
                            {product.category_name || 'No Category'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${stockStatus.color}`}>
                              {product.quantity_in_stock}
                            </span>
                            {stockStatus.status === 'Low' && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="font-medium">${product.unit_price}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            product.status === 'active' ? 'badge-success' : 'badge-danger'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateStock(product)}
                              className="btn btn-sm btn-outline"
                              title="Update Stock"
                            >
                              <Package className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="btn btn-sm btn-outline"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn btn-sm btn-danger"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          isEditing={isEditing}
          categories={categories}
          onSave={handleProductSaved}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {showStockModal && (
        <StockUpdateModal
          product={selectedProduct}
          onSave={handleStockUpdated}
          onClose={() => setShowStockModal(false)}
        />
      )}
    </div>
  );
}

export default Products;