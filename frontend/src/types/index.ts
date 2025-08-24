// Auth types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  isEmailVerified: boolean
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  subscriptionPlan: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
  tenantSlug?: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
  organizationSlug: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    organization: Organization
    tokens: AuthTokens
  }
}

// Product types
export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  categoryId?: string
  supplierId?: string
  unitOfMeasure: string
  costPrice?: number
  sellingPrice?: number
  minStockLevel: number
  maxStockLevel?: number
  reorderPoint: number
  weight?: number
  dimensions?: Record<string, any>
  images: string[]
  isActive: boolean
  isTrackable: boolean
  hasVariants: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  barcode?: string
  attributes: Record<string, any>
  costPrice?: number
  sellingPrice?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Inventory types
export interface InventoryItem {
  id: string
  productId: string
  variantId?: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lastCountedAt?: string
  lastMovementAt: string
  product?: Product
  variant?: ProductVariant
  warehouse?: Warehouse
}

export interface InventoryMovement {
  id: string
  inventoryId: string
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  referenceType?: string
  referenceId?: string
  notes?: string
  performedBy?: string
  performedAt: string
}

// Warehouse types
export interface Warehouse {
  id: string
  name: string
  code: string
  address?: Record<string, any>
  managerId?: string
  capacity?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  children?: Category[]
}

// Supplier types
export interface Supplier {
  id: string
  name: string
  code?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: Record<string, any>
  taxId?: string
  paymentTerms?: number
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

// Order types
export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled'
  orderDate: string
  expectedDate?: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  supplier?: Supplier
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  variantId?: string
  quantity: number
  receivedQuantity: number
  unitCost: number
  totalCost: number
  createdAt: string
  product?: Product
  variant?: ProductVariant
}

// Common API response types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  success: false
  error: string
  details?: any
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number
  lowStockItems: number
  totalOrders: number
  totalValue: number
  recentMovements: InventoryMovement[]
  topProducts: Array<{
    product: Product
    quantity: number
    value: number
  }>
}

// Form types
export interface ProductFormData {
  name: string
  description?: string
  sku: string
  barcode?: string
  categoryId?: string
  supplierId?: string
  unitOfMeasure: string
  costPrice?: number
  sellingPrice?: number
  minStockLevel: number
  maxStockLevel?: number
  reorderPoint: number
  weight?: number
  isActive: boolean
  isTrackable: boolean
}

export interface WarehouseFormData {
  name: string
  code: string
  address?: Record<string, any>
  managerId?: string
  capacity?: number
  isActive: boolean
}

// Socket types for real-time updates
export interface SocketInventoryUpdate {
  type: 'inventory_updated'
  data: {
    inventoryId: string
    productId: string
    warehouseId: string
    oldQuantity: number
    newQuantity: number
    movementType: string
  }
}

export interface SocketOrderUpdate {
  type: 'order_updated'
  data: {
    orderId: string
    oldStatus: string
    newStatus: string
  }
}