import React, { useState } from 'react';
import { X, Package, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

function StockUpdateModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    quantity: '',
    movement_type: 'IN',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!formData.quantity || isNaN(parseInt(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a valid number';
    }

    if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.movement_type === 'OUT' && parseInt(formData.quantity) > product.quantity_in_stock) {
      newErrors.quantity = 'Cannot remove more stock than available';
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
        quantity: parseInt(formData.quantity),
        movement_type: formData.movement_type,
        notes: formData.notes
      };

      await productService.updateStock(product.id, dataToSubmit);
      toast.success('Stock updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating stock:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update stock');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultingStock = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const currentStock = product.quantity_in_stock;
    
    switch (formData.movement_type) {
      case 'IN':
        return currentStock + quantity;
      case 'OUT':
        return Math.max(0, currentStock - quantity);
      case 'ADJUSTMENT':
        return quantity;
      default:
        return currentStock;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Stock</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>SKU: {product.sku}</div>
              <div>Current Stock: <span className="font-medium">{product.quantity_in_stock}</span></div>
              <div>Min Level: {product.min_stock_level}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select
                name="movement_type"
                value={formData.movement_type}
                onChange={handleInputChange}
                className="form-input form-select"
              >
                <option value="IN">Stock In (+)</option>
                <option value="OUT">Stock Out (-)</option>
                <option value="ADJUSTMENT">Adjustment (=)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Quantity *
                {formData.movement_type === 'ADJUSTMENT' && (
                  <span className="text-sm text-gray-500 ml-2">(Set total quantity)</span>
                )}
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="Enter quantity"
                min="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="Optional notes about this stock movement"
                rows="3"
              />
            </div>

            {/* Preview */}
            {formData.quantity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {getMovementIcon(formData.movement_type)}
                    <span className="ml-2 font-medium">
                      {formData.movement_type === 'IN' && 'Adding'}
                      {formData.movement_type === 'OUT' && 'Removing'}
                      {formData.movement_type === 'ADJUSTMENT' && 'Setting to'}
                    </span>
                  </div>
                  <span className="font-semibold">{formData.quantity} units</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  New stock level: <span className="font-medium text-blue-600">{getResultingStock()}</span>
                </div>
              </div>
            )}

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
                    Updating...
                  </>
                ) : (
                  'Update Stock'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StockUpdateModal;