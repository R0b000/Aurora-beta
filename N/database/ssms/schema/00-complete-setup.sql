-- SSMS Master Setup - Tables + Procedures (Fixed)
-- Run this to fix missing columns and create procedures

-- ============================================================================
-- FIX TABLES - Add missing columns if needed
-- ============================================================================

-- Banners: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND name = N'link_url')
BEGIN
    ALTER TABLE [dbo].[banners] ADD [link_url] NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND name = N'created_at')
BEGIN
    ALTER TABLE [dbo].[banners] ADD [created_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[banners] ADD [updated_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND name = N'position')
BEGIN
    ALTER TABLE [dbo].[banners] ADD [position] NVARCHAR(60) DEFAULT 'home';
END
GO

-- Users: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'avatar_url')
BEGIN
    ALTER TABLE [dbo].[users] ADD [avatar_url] NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'is_verified')
BEGIN
    ALTER TABLE [dbo].[users] ADD [is_verified] BIT DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[users] ADD [updated_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

-- Categories: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND name = N'description')
BEGIN
    ALTER TABLE [dbo].[categories] ADD [description] NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND name = N'image_url')
BEGIN
    ALTER TABLE [dbo].[categories] ADD [image_url] NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND name = N'parent_id')
BEGIN
    ALTER TABLE [dbo].[categories] ADD [parent_id] BIGINT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[categories] ADD [updated_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

-- Products: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = N'description')
BEGIN
    ALTER TABLE [dbo].[products] ADD [description] NVARCHAR(MAX) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = N'discount_price')
BEGIN
    ALTER TABLE [dbo].[products] ADD [discount_price] DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = N'sku')
BEGIN
    ALTER TABLE [dbo].[products] ADD [sku] NVARCHAR(80) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[products] ADD [updated_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

-- Coupons: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[coupons]') AND name = N'created_at')
BEGIN
    ALTER TABLE [dbo].[coupons] ADD [created_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[coupons]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[coupons] ADD [updated_at] DATETIME2 DEFAULT GETUTCDATE();
END
GO

-- Orders: add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'order_number')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [order_number] NVARCHAR(40) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'subtotal')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [subtotal] DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'created_at')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [created_at] DATETIME2 NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'discount')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [discount] DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'shipping')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [shipping] DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'payment_status')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [payment_status] NVARCHAR(20) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[orders] ADD [updated_at] DATETIME2 NULL;
END
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Banner
IF OBJECT_ID(N'[dbo].[usp_Banner]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Banner];
GO
CREATE PROCEDURE [dbo].[usp_Banner]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @title NVARCHAR(190) = NULL,
    @image_url NVARCHAR(500) = NULL,
    @link_url NVARCHAR(500) = NULL,
    @is_active BIT = NULL,
    @sort_order INT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[banners] (title, image_url, link_url, is_active, sort_order)
            VALUES (@title, @image_url, @link_url, ISNULL(@is_active, 1), ISNULL(@sort_order, 0));
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, title, image_url, link_url, is_active, sort_order
            FROM [dbo].[banners] WITH (NOLOCK)
            WHERE (@is_active IS NULL OR is_active = @is_active);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[banners]
            SET title = ISNULL(@title, title),
                image_url = ISNULL(@image_url, image_url),
                is_active = ISNULL(@is_active, is_active),
                sort_order = ISNULL(@sort_order, sort_order)
            WHERE id = @id;
        END
        ELSE IF @Flag = 'D'
        BEGIN
            DELETE FROM [dbo].[banners] WHERE id = @id;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- User
IF OBJECT_ID(N'[dbo].[usp_User]', N'P') IS NOT NULL DROP PROC [dbo].[usp_User];
GO
CREATE PROCEDURE [dbo].[usp_User]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @name NVARCHAR(120) = NULL,
    @email NVARCHAR(190) = NULL,
    @password_hash NVARCHAR(255) = NULL,
    @role NVARCHAR(20) = NULL,
    @phone NVARCHAR(30) = NULL,
    @is_banned BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[users] (name, email, password_hash, role, phone)
            VALUES (@name, @email, @password_hash, ISNULL(@role, 'customer'), @phone);
            SELECT id, name, email, role, phone FROM [dbo].[users] WHERE id = SCOPE_IDENTITY();
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, name, email, password_hash, role, phone, is_banned FROM [dbo].[users] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id) AND (@email IS NULL OR email = @email);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[users]
            SET name = ISNULL(@name, name), phone = ISNULL(@phone, phone), is_banned = ISNULL(@is_banned, is_banned)
            WHERE id = @id;
        END
        ELSE IF @Flag = 'E'
        BEGIN
            SELECT COUNT(1) AS exists_count FROM [dbo].[users] WITH (NOLOCK) WHERE email = @email;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Category
IF OBJECT_ID(N'[dbo].[usp_Category]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Category];
GO
CREATE PROCEDURE [dbo].[usp_Category]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @name NVARCHAR(120) = NULL,
    @slug NVARCHAR(140) = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[categories] (name, slug, is_active)
            VALUES (@name, @slug, 1);
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, name, slug FROM [dbo].[categories] WITH (NOLOCK);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[categories]
            SET name = ISNULL(@name, name), slug = ISNULL(@slug, slug)
            WHERE id = @id;
        END
        ELSE IF @Flag = 'D'
        BEGIN
            DELETE FROM [dbo].[categories] WHERE id = @id;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Product
IF OBJECT_ID(N'[dbo].[usp_Product]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Product];
GO
CREATE PROCEDURE [dbo].[usp_Product]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @seller_id BIGINT = NULL,
    @category_id BIGINT = NULL,
    @name NVARCHAR(190) = NULL,
    @slug NVARCHAR(220) = NULL,
    @price DECIMAL(10,2) = NULL,
    @stock INT = NULL,
    @is_active BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[products] (seller_id, category_id, name, slug, price, stock, is_active)
            VALUES (@seller_id, @category_id, @name, @slug, @price, ISNULL(@stock, 0), ISNULL(@is_active, 1));
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, seller_id, category_id, name, slug, price, stock, is_active FROM [dbo].[products] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id) AND (@seller_id IS NULL OR seller_id = @seller_id);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[products]
            SET name = ISNULL(@name, name), price = ISNULL(@price, price), stock = ISNULL(@stock, stock), is_active = ISNULL(@is_active, is_active)
            WHERE id = @id;
        END
        ELSE IF @Flag = 'D'
        BEGIN
            DELETE FROM [dbo].[products] WHERE id = @id;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Coupon
IF OBJECT_ID(N'[dbo].[usp_Coupon]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Coupon];
GO
CREATE PROCEDURE [dbo].[usp_Coupon]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @code NVARCHAR(60) = NULL,
    @type NVARCHAR(20) = NULL,
    @value DECIMAL(10,2) = NULL,
    @is_active BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[coupons] (code, type, value, is_active)
            VALUES (@code, @type, @value, ISNULL(@is_active, 1));
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, code, type, value, is_active FROM [dbo].[coupons] WITH (NOLOCK);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[coupons]
            SET code = ISNULL(@code, code), type = ISNULL(@type, type), value = ISNULL(@value, value), is_active = ISNULL(@is_active, is_active)
            WHERE id = @id;
        END
        ELSE IF @Flag = 'D'
        BEGIN
            DELETE FROM [dbo].[coupons] WHERE id = @id;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Cart
IF OBJECT_ID(N'[dbo].[usp_Cart]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Cart];
GO
CREATE PROCEDURE [dbo].[usp_Cart]
    @Flag CHAR(1) = 'R',
    @user_id BIGINT = NULL,
    @cart_id BIGINT = NULL,
    @product_id BIGINT = NULL,
    @quantity INT = NULL,
    @unit_price DECIMAL(10,2) = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[cart] (user_id, is_active) VALUES (@user_id, 1);
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT TOP 1 * FROM [dbo].[cart] WITH (NOLOCK) WHERE user_id = @user_id AND is_active = 1;
        END
        ELSE IF @Flag = 'I'
        BEGIN
            IF EXISTS (SELECT 1 FROM [dbo].[cart_items] WHERE cart_id = @cart_id AND product_id = @product_id)
                UPDATE [dbo].[cart_items] SET quantity = quantity + @quantity
                WHERE cart_id = @cart_id AND product_id = @product_id;
            ELSE
                INSERT INTO [dbo].[cart_items] (cart_id, product_id, quantity, unit_price)
                VALUES (@cart_id, @product_id, @quantity, @unit_price);
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Order
IF OBJECT_ID(N'[dbo].[usp_Order]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Order];
GO
CREATE PROCEDURE [dbo].[usp_Order]
    @Flag CHAR(1) = 'R',
    @user_id BIGINT = NULL,
    @order_id BIGINT = NULL,
    @product_id BIGINT = NULL,
    @subtotal DECIMAL(10,2) = NULL,
    @discount DECIMAL(10,2) = NULL,
    @shipping DECIMAL(10,2) = NULL,
    @total DECIMAL(10,2) = NULL,
    @quantity INT = NULL,
    @unit_price DECIMAL(10,2) = NULL,
    @full_name NVARCHAR(120) = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        IF @Flag = 'C'
        BEGIN
            DECLARE @order_number NVARCHAR(40) = 'ORD' + FORMAT(GETUTCDATE(), 'yyyyMMddHHmmss') + LEFT(NEWID(), 6);
            
            INSERT INTO [dbo].[orders] (order_number, user_id, subtotal, discount, shipping, total, status, payment_status)
            VALUES (@order_number, @user_id, @subtotal, ISNULL(@discount, 0), ISNULL(@shipping, 0), @total, 'pending', 'unpaid');
            SELECT SCOPE_IDENTITY() AS id, @order_number AS order_number;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, order_number, user_id, subtotal, discount, shipping, total, status, payment_status
            FROM [dbo].[orders] WITH (NOLOCK) WHERE user_id = @user_id ORDER BY id DESC;
        END
        ELSE IF @Flag = 'I'
        BEGIN
            INSERT INTO [dbo].[order_items] (order_id, product_id, quantity, unit_price, line_total)
            VALUES (@order_id, @product_id, @quantity, @unit_price, @quantity * @unit_price);
        END
        ELSE IF @Flag = 'A'
        BEGIN
            INSERT INTO [dbo].[order_addresses] (order_id, full_name, phone, line1)
            VALUES (@order_id, @full_name, NULL, NULL);
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'All procedures created!';
GO

-- ============================================================================
-- SESSION PROCEDURES
-- ============================================================================
IF OBJECT_ID(N'[dbo].[sp_create_session]', N'P') IS NOT NULL DROP PROC [dbo].[sp_create_session];
GO
CREATE PROCEDURE [dbo].[sp_create_session]
    @user_id BIGINT,
    @refresh_token_hash NVARCHAR(255),
    @ip NVARCHAR(45) = NULL,
    @user_agent NVARCHAR(500) = NULL,
    @expires_at DATETIME2
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        INSERT INTO [dbo].[sessions] (user_id, refresh_token_hash, ip, user_agent, expires_at)
        VALUES (@user_id, @refresh_token_hash, @ip, @user_agent, @expires_at);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID(N'[dbo].[sp_find_active_session]', N'P') IS NOT NULL DROP PROC [dbo].[sp_find_active_session];
GO
CREATE PROCEDURE [dbo].[sp_find_active_session]
    @refresh_token_hash NVARCHAR(255)
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT id, user_id, refresh_token_hash, ip, user_agent, expires_at, created_at
        FROM [dbo].[sessions] WITH (NOLOCK)
        WHERE refresh_token_hash = @refresh_token_hash
          AND revoked_at IS NULL
          AND expires_at > GETUTCDATE();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID(N'[dbo].[sp_revoke_session]', N'P') IS NOT NULL DROP PROC [dbo].[sp_revoke_session];
GO
CREATE PROCEDURE [dbo].[sp_revoke_session]
    @refresh_token_hash NVARCHAR(255)
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        UPDATE [dbo].[sessions]
        SET revoked_at = GETUTCDATE()
        WHERE refresh_token_hash = @refresh_token_hash;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO