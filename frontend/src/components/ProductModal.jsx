import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

function ProductModal({ product, isEditing, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    unit_price: '',
    cost_price: '',
    quantity_in_stock: '',
    min_stock_level: '',
    max_stock_level: '',
    barcode: '',
    location: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        unit_price: product.unit_price || '',
        cost_price: product.cost_price || '',
        quantity_in_stock: product.quantity_in_stock || '',
        min_stock_level: product.min_stock_level || '',
        max_stock_level: product.max_stock_level || '',
        barcode: product.barcode || '',
        location: product.location || '',
        status: product.status || 'active'
      });
    }
  }, [isEditing, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.unit_price && isNaN(parseFloat(formData.unit_price))) {
      newErrors.unit_price = 'Unit price must be a valid number';
    }

    if (formData.cost_price && isNaN(parseFloat(formData.cost_price))) {
      newErrors.cost_price = 'Cost price must be a valid number';
    }

    if (formData.quantity_in_stock && isNaN(parseInt(formData.quantity_in_stock))) {
      newErrors.quantity_in_stock = 'Quantity must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        unit_price: parseFloat(formData.unit_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        quantity_in_stock: parseInt(formData.quantity_in_stock) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        max_stock_level: parseInt(formData.max_stock_level) || 1000,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null
      };

      if (isEditing) {
        await productService.update(product.id, dataToSubmit);
        toast.success('Product updated successfully');
      } else {
        await productService.create(dataToSubmit);
        toast.success('Product created successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`form-input ${errors.sku ? 'border-red-500' : ''}`}
                placeholder="Enter SKU"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input form-textarea"
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="form-input form-select"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Unit Price</label>
              <input
                type="number"
                step="0.01"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleInputChange}
                className={`form-input ${errors.unit_price ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.unit_price && <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price</label>
              <input
                type="number"
                step="0.01"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleInputChange}
                className={`form-input ${errors.cost_price ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.cost_price && <p className="text-red-500 text-sm mt-1">{errors.cost_price}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Current Stock</label>
              <input
                type="number"
                name="quantity_in_stock"
                value={formData.quantity_in_stock}
                onChange={handleInputChange}
                className={`form-input ${errors.quantity_in_stock ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.quantity_in_stock && <p className="text-red-500 text-sm mt-1">{errors.quantity_in_stock}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Min Stock Level</label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Stock Level</label>
              <input
                type="number"
                name="max_stock_level"
                value={formData.max_stock_level}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter barcode"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., A1-B2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;