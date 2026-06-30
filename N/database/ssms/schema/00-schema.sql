-- SSMS Schema (SQL Server)
-- Complete schema for all tables

-- ============================================================================
-- 1. AUTH & USERS
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        id           BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name         NVARCHAR(120) NOT NULL,
        email        NVARCHAR(190) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role         NVARCHAR(20) NOT NULL DEFAULT 'customer',
        phone        NVARCHAR(30) NULL,
        avatar_url   NVARCHAR(500) NULL,
        is_verified  BIT NOT NULL DEFAULT 0,
        is_banned    BIT NOT NULL DEFAULT 0,
        created_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sessions] (
        id                 BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id            BIGINT NOT NULL,
        refresh_token_hash NVARCHAR(255) NOT NULL,
        ip                 NVARCHAR(45) NULL,
        user_agent         NVARCHAR(500) NULL,
        expires_at         DATETIME2 NOT NULL,
        revoked_at         DATETIME2 NULL,
        created_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_sessions_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND name = N'idx_sessions_token')
BEGIN
    CREATE INDEX idx_sessions_token ON [dbo].[sessions](refresh_token_hash);
END
GO

-- ============================================================================
-- 2. SELLER & PROFILE
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[seller_profiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[seller_profiles] (
        id           BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id      BIGINT NOT NULL UNIQUE,
        company_name NVARCHAR(190) NOT NULL,
        gst_number   NVARCHAR(50) NULL,
        bio          NVARCHAR(MAX) NULL,
        address      NVARCHAR(255) NULL,
        rating       DECIMAL(2,1) NOT NULL DEFAULT 0.0,
        total_reviews INT NOT NULL DEFAULT 0,
        status       NVARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_seller_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_addresses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_addresses] (
        id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id     BIGINT NOT NULL,
        label       NVARCHAR(60) NULL,
        full_name   NVARCHAR(120) NOT NULL,
        phone       NVARCHAR(30) NOT NULL,
        line1       NVARCHAR(190) NOT NULL,
        line2       NVARCHAR(190) NULL,
        city        NVARCHAR(120) NOT NULL,
        state       NVARCHAR(120) NULL,
        postal_code NVARCHAR(20) NULL,
        country     NVARCHAR(120) NOT NULL DEFAULT 'Nepal',
        is_default  BIT NOT NULL DEFAULT 0,
        created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_addr_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 3. CATALOG
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[categories] (
        id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name        NVARCHAR(120) NOT NULL,
        slug        NVARCHAR(140) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NULL,
        image_url   NVARCHAR(500) NULL,
        parent_id   BIGINT NULL,
        is_active   BIT NOT NULL DEFAULT 1,
        created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_category_parent FOREIGN KEY (parent_id) REFERENCES [dbo].[categories](id) ON DELETE SET NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[coupons]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[coupons] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        code       NVARCHAR(60) NOT NULL UNIQUE,
        type       NVARCHAR(20) NOT NULL,
        value      DECIMAL(10,2) NOT NULL,
        is_active  BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[products] (
        id             BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        seller_id      BIGINT NOT NULL,
        category_id    BIGINT NULL,
        name           NVARCHAR(190) NOT NULL,
        slug           NVARCHAR(220) NOT NULL UNIQUE,
        description    NVARCHAR(MAX) NULL,
        price          DECIMAL(10,2) NOT NULL,
        discount_price DECIMAL(10,2) NULL,
        stock          INT NOT NULL DEFAULT 0,
        sku            NVARCHAR(80) NULL,
        is_active      BIT NOT NULL DEFAULT 1,
        created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_product_seller FOREIGN KEY (seller_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE,
        CONSTRAINT FK_product_category FOREIGN KEY (category_id) REFERENCES [dbo].[categories](id) ON DELETE SET NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[banners] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        title      NVARCHAR(190) NOT NULL,
        image_url  NVARCHAR(500) NOT NULL,
        link_url   NVARCHAR(500) NULL,
        position   NVARCHAR(60) NOT NULL DEFAULT 'home',
        is_active  BIT NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        start_at   DATETIME2 NULL,
        end_at     DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- ============================================================================
-- 5. CART
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cart]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cart] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id    BIGINT NOT NULL,
        is_active  BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_cart_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cart_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cart_items] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        cart_id    BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity   INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_cartitem_cart FOREIGN KEY (cart_id) REFERENCES [dbo].[cart](id) ON DELETE CASCADE,
        CONSTRAINT FK_cartitem_product FOREIGN KEY (product_id) REFERENCES [dbo].[products](id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 4. ORDERS
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[orders] (
        id             BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_number   NVARCHAR(40) NOT NULL UNIQUE,
        user_id        BIGINT NOT NULL,
        subtotal       DECIMAL(10,2) NOT NULL,
        discount       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
        shipping       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
        total          DECIMAL(10,2) NOT NULL,
        status         NVARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_status NVARCHAR(20) NOT NULL DEFAULT 'unpaid',
        created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_order_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE RESTRICT
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[order_items] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id   BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity   INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        line_total DECIMAL(10,2) NOT NULL,
        CONSTRAINT FK_oitem_order FOREIGN KEY (order_id) REFERENCES [dbo].[orders](id) ON DELETE CASCADE,
        CONSTRAINT FK_oitem_product FOREIGN KEY (product_id) REFERENCES [dbo].[products](id) ON DELETE RESTRICT
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[transactions] (
        id                BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id          BIGINT NOT NULL,
        transaction_id    NVARCHAR(120) NULL,
        status            NVARCHAR(40) NULL,
        total_amount      NVARCHAR(40) NULL,
        created_at        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_txn_order FOREIGN KEY (order_id) REFERENCES [dbo].[orders](id) ON DELETE CASCADE
    );
END
GO