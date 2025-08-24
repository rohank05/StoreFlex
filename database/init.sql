-- StoreFlex Multi-Tenant Database Initialization

-- Create database if not exists
-- CREATE DATABASE IF NOT EXISTS storeflex;

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shared schema for tenant management and auth
CREATE SCHEMA IF NOT EXISTS shared;

-- Set default search path
ALTER DATABASE storeflex SET search_path TO shared, public;

-- Shared tables for multi-tenant architecture
CREATE TABLE IF NOT EXISTS shared.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    schema_name VARCHAR(63) UNIQUE NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES shared.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON shared.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON shared.tenants(domain);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON shared.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON shared.users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON shared.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON shared.user_sessions(refresh_token);

-- Function to create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name VARCHAR(63))
RETURNS VOID AS $$
BEGIN
    -- Create the schema
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(schema_name);
    
    -- Set search path for this session
    EXECUTE 'SET search_path TO ' || quote_ident(schema_name) || ', shared, public';
    
    -- Create roles table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            permissions JSONB DEFAULT ''[]'',
            is_system BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Create user_roles table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.user_roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            role_id UUID REFERENCES %I.roles(id) ON DELETE CASCADE,
            assigned_by UUID,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name);
    
    -- Create categories table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            parent_id UUID REFERENCES %I.categories(id),
            image_url VARCHAR(500),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name);
    
    -- Create suppliers table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.suppliers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE,
            contact_person VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(50),
            address JSONB,
            tax_id VARCHAR(100),
            payment_terms INTEGER DEFAULT 30,
            is_active BOOLEAN DEFAULT true,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Create warehouses table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.warehouses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE,
            address JSONB,
            manager_id UUID,
            capacity DECIMAL(15,2),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Create products table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            sku VARCHAR(100) UNIQUE NOT NULL,
            barcode VARCHAR(100),
            category_id UUID REFERENCES %I.categories(id),
            supplier_id UUID REFERENCES %I.suppliers(id),
            unit_of_measure VARCHAR(50) DEFAULT ''pcs'',
            cost_price DECIMAL(15,2),
            selling_price DECIMAL(15,2),
            min_stock_level INTEGER DEFAULT 0,
            max_stock_level INTEGER,
            reorder_point INTEGER DEFAULT 0,
            weight DECIMAL(10,3),
            dimensions JSONB,
            images JSONB DEFAULT ''[]'',
            is_active BOOLEAN DEFAULT true,
            is_trackable BOOLEAN DEFAULT true,
            has_variants BOOLEAN DEFAULT false,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name, schema_name);
    
    -- Create product_variants table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.product_variants (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID REFERENCES %I.products(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            sku VARCHAR(100) UNIQUE NOT NULL,
            barcode VARCHAR(100),
            attributes JSONB DEFAULT ''{}'' ,
            cost_price DECIMAL(15,2),
            selling_price DECIMAL(15,2),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name);
    
    -- Create inventory table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.inventory (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID REFERENCES %I.products(id) ON DELETE CASCADE,
            variant_id UUID REFERENCES %I.product_variants(id) ON DELETE CASCADE,
            warehouse_id UUID REFERENCES %I.warehouses(id) ON DELETE CASCADE,
            quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
            reserved_quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
            available_quantity DECIMAL(15,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
            last_counted_at TIMESTAMP WITH TIME ZONE,
            last_movement_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(product_id, variant_id, warehouse_id)
        )', schema_name, schema_name, schema_name, schema_name);
    
    -- Create inventory_movements table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.inventory_movements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            inventory_id UUID REFERENCES %I.inventory(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL, -- IN, OUT, TRANSFER, ADJUSTMENT, RETURN
            quantity DECIMAL(15,3) NOT NULL,
            reference_type VARCHAR(50), -- ORDER, TRANSFER, ADJUSTMENT, etc.
            reference_id UUID,
            notes TEXT,
            performed_by UUID,
            performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name);
    
    -- Create purchase_orders table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.purchase_orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            po_number VARCHAR(100) UNIQUE NOT NULL,
            supplier_id UUID REFERENCES %I.suppliers(id),
            status VARCHAR(50) DEFAULT ''draft'', -- draft, sent, confirmed, partially_received, received, cancelled
            order_date DATE NOT NULL,
            expected_date DATE,
            subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
            tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            notes TEXT,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name);
    
    -- Create purchase_order_items table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.purchase_order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            purchase_order_id UUID REFERENCES %I.purchase_orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES %I.products(id),
            variant_id UUID REFERENCES %I.product_variants(id),
            quantity DECIMAL(15,3) NOT NULL,
            received_quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
            unit_cost DECIMAL(15,2) NOT NULL,
            total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name, schema_name, schema_name, schema_name);
    
    -- Create audit_logs table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            table_name VARCHAR(100) NOT NULL,
            record_id UUID,
            action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
            old_values JSONB,
            new_values JSONB,
            changed_fields TEXT[],
            user_id UUID,
            ip_address INET,
            user_agent TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Create indexes for the tenant schema
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_roles_user_id ON %I.user_roles(user_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_roles_role_id ON %I.user_roles(role_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_products_sku ON %I.products(sku)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_products_category_id ON %I.products(category_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_inventory_product_id ON %I.inventory(product_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_inventory_warehouse_id ON %I.inventory(warehouse_id)', schema_name, schema_name);
    
    -- Insert default roles
    EXECUTE format('
        INSERT INTO %I.roles (name, description, permissions, is_system) VALUES
        (''Super Admin'', ''Full system access'', ''["*"]'', true),
        (''Admin'', ''Organization administration'', ''["users.*", "products.*", "inventory.*", "orders.*", "reports.*"]'', true),
        (''Manager'', ''Department management'', ''["products.read", "products.write", "inventory.*", "orders.*", "reports.read"]'', true),
        (''Employee'', ''Basic access'', ''["products.read", "inventory.read", "orders.read"]'', true),
        (''Viewer'', ''Read-only access'', ''["*.read"]'', true)
        ON CONFLICT (name) DO NOTHING
    ', schema_name);
    
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to shared tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON shared.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON shared.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();