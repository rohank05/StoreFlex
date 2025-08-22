import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  History
} from 'lucide-react';
import { importService } from '../services/api';
import toast from 'react-hot-toast';

function Import() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await importService.getHistory();
      setImportHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const response = await importService.uploadFile(file);
      const result = response.data.data;
      
      toast.success(`Import completed! ${result.successfulRows} rows imported successfully`);
      
      if (result.failedRows > 0) {
        toast.error(`${result.failedRows} rows failed to import`);
      }
      
      // Refresh import history
      fetchImportHistory();
    } catch (error) {
      console.error('Import error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to import file');
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await importService.downloadTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (successfulRows, failedRows) => {
    if (failedRows === 0) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (successfulRows === 0) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
          <p className="text-gray-600">Upload CSV or Excel files to add/update products in bulk</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn btn-outline"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-body">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="spinner mx-auto"></div>
                <p className="text-gray-600">Uploading and processing file...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your file here, or{' '}
                    <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports CSV, XLSX, and XLS files up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Format Instructions */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">File Format Requirements:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Required columns: <strong>name</strong>, <strong>sku</strong></p>
              <p>• Optional columns: description, category, supplier, unit_price, cost_price, quantity, min_stock, max_stock, barcode, location, status</p>
              <p>• Use the template for best results</p>
              <p>• Existing products (matching SKU) will be updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import History */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <History className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Import History</h3>
          </div>
        </div>
        <div className="card-body p-0">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
              <span className="ml-2 text-gray-600">Loading history...</span>
            </div>
          ) : importHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              No import history available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Date</th>
                    <th>Total Rows</th>
                    <th>Successful</th>
                    <th>Failed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importHistory.map((importLog, index) => (
                    <tr key={index}>
                      <td>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{importLog.filename}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {formatDate(importLog.imported_at)}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium">{importLog.total_rows}</span>
                      </td>
                      <td>
                        <span className="text-green-600 font-medium">{importLog.successful_rows}</span>
                      </td>
                      <td>
                        <span className="text-red-600 font-medium">{importLog.failed_rows}</span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          {getStatusIcon(importLog.successful_rows, importLog.failed_rows)}
                          <span className="ml-2 text-sm">
                            {importLog.failed_rows === 0 ? 'Complete' : 
                             importLog.successful_rows === 0 ? 'Failed' : 'Partial'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Import Tips</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Always use the provided template</li>
                <li>• Ensure SKUs are unique for each product</li>
                <li>• Use consistent category and supplier names</li>
                <li>• Validate data before importing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Duplicate SKUs will update existing products</li>
                <li>• Invalid numbers in price fields will be ignored</li>
                <li>• Missing required fields will cause row failure</li>
                <li>• Large files may take time to process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Import;