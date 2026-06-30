-- SSMS Master Setup - Run this file to create all stored procedures
-- Execute in SSMS or sqlcmd after tables are created

-- ============================================================================
-- BANNER PROCEDURE
-- ============================================================================
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
            SELECT id, title, image_url, link_url, position, is_active, sort_order, created_at, updated_at
            FROM [dbo].[banners] WITH (NOLOCK)
            WHERE (@is_active IS NULL OR is_active = @is_active)
              AND (@id IS NULL OR id = @id);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[banners]
            SET title = ISNULL(@title, title),
                image_url = ISNULL(@image_url, image_url),
                link_url = ISNULL(@link_url, link_url),
                is_active = ISNULL(@is_active, is_active),
                sort_order = ISNULL(@sort_order, sort_order),
                updated_at = GETUTCDATE()
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

-- ============================================================================
-- USER PROCEDURE
-- ============================================================================
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
            INSERT INTO [dbo].[users] (name, email, password_hash, role, phone, is_verified, is_banned)
            VALUES (@name, @email, @password_hash, ISNULL(@role, 'customer'), @phone, 1, ISNULL(@is_banned, 0));
            SELECT id, name, email, role, phone, avatar_url, is_verified, is_banned, created_at, updated_at
            FROM [dbo].[users] WHERE id = SCOPE_IDENTITY();
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, name, email, password_hash, role, phone, avatar_url, is_verified, is_banned, created_at, updated_at
            FROM [dbo].[users] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@email IS NULL OR email = @email);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[users]
            SET name = ISNULL(@name, name),
                phone = ISNULL(@phone, phone),
                is_banned = ISNULL(@is_banned, is_banned),
                updated_at = GETUTCDATE()
            WHERE id = @id;
        END
        ELSE IF @Flag = 'E'
        BEGIN
            SELECT COUNT(1) AS exists_count
            FROM [dbo].[users] WITH (NOLOCK)
            WHERE email = @email;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================================
-- CATEGORY PROCEDURE
-- ============================================================================
IF OBJECT_ID(N'[dbo].[usp_Category]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Category];
GO
CREATE PROCEDURE [dbo].[usp_Category]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @name NVARCHAR(120) = NULL,
    @slug NVARCHAR(140) = NULL,
    @description NVARCHAR(MAX) = NULL,
    @image_url NVARCHAR(500) = NULL,
    @parent_id BIGINT = NULL,
    @is_active BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[categories] (name, slug, description, image_url, parent_id, is_active)
            VALUES (@name, @slug, @description, @image_url, @parent_id, ISNULL(@is_active, 1));
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, name, slug, description, image_url, parent_id, is_active, created_at, updated_at
            FROM [dbo].[categories] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@slug IS NULL OR slug = @slug)
              AND (@is_active IS NULL OR is_active = @is_active);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[categories]
            SET name = ISNULL(@name, name),
                slug = ISNULL(@slug, slug),
                description = ISNULL(@description, description),
                image_url = ISNULL(@image_url, image_url),
                parent_id = ISNULL(@parent_id, parent_id),
                is_active = ISNULL(@is_active, is_active),
                updated_at = GETUTCDATE()
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

-- ============================================================================
-- PRODUCT PROCEDURE
-- ============================================================================
IF OBJECT_ID(N'[dbo].[usp_Product]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Product];
GO
CREATE PROCEDURE [dbo].[usp_Product]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @seller_id BIGINT = NULL,
    @category_id BIGINT = NULL,
    @name NVARCHAR(190) = NULL,
    @slug NVARCHAR(220) = NULL,
    @description NVARCHAR(MAX) = NULL,
    @price DECIMAL(10,2) = NULL,
    @discount_price DECIMAL(10,2) = NULL,
    @stock INT = NULL,
    @sku NVARCHAR(80) = NULL,
    @is_active BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF @Flag = 'C'
        BEGIN
            INSERT INTO [dbo].[products] (seller_id, category_id, name, slug, description, price, discount_price, stock, sku, is_active)
            VALUES (@seller_id, @category_id, @name, @slug, @description, @price, @discount_price, ISNULL(@stock, 0), @sku, ISNULL(@is_active, 1));
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, seller_id, category_id, name, slug, description, price, discount_price, stock, sku, is_active, created_at, updated_at
            FROM [dbo].[products] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@seller_id IS NULL OR seller_id = @seller_id)
              AND (@slug IS NULL OR slug = @slug);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[products]
            SET category_id = ISNULL(@category_id, category_id),
                name = ISNULL(@name, name),
                slug = ISNULL(@slug, slug),
                description = ISNULL(@description, description),
                price = ISNULL(@price, price),
                discount_price = ISNULL(@discount_price, discount_price),
                stock = ISNULL(@stock, stock),
                sku = ISNULL(@sku, sku),
                is_active = ISNULL(@is_active, is_active),
                updated_at = GETUTCDATE()
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

-- ============================================================================
-- COUPON PROCEDURE
-- ============================================================================
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
            SELECT id, code, type, value, is_active, created_at, updated_at
            FROM [dbo].[coupons] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@code IS NULL OR code = @code)
              AND (@is_active IS NULL OR is_active = @is_active);
        END
        ELSE IF @Flag = 'U'
        BEGIN
            UPDATE [dbo].[coupons]
            SET code = ISNULL(@code, code),
                type = ISNULL(@type, type),
                value = ISNULL(@value, value),
                is_active = ISNULL(@is_active, is_active),
                updated_at = GETUTCDATE()
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

-- ============================================================================
-- CART PROCEDURE
-- ============================================================================
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
            SELECT TOP 1 * FROM [dbo].[cart] WITH (NOLOCK)
            WHERE user_id = @user_id AND is_active = 1;
        END
        ELSE IF @Flag = 'I'
        BEGIN
            IF EXISTS (SELECT 1 FROM [dbo].[cart_items] WITH (NOLOCK) WHERE cart_id = @cart_id AND product_id = @product_id)
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

-- ============================================================================
-- ORDER PROCEDURE
-- ============================================================================
IF OBJECT_ID(N'[dbo].[usp_Order]', N'P') IS NOT NULL DROP PROC [dbo].[usp_Order];
GO
CREATE PROCEDURE [dbo].[usp_Order]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @user_id BIGINT = NULL,
    @order_id BIGINT = NULL,
    @product_id BIGINT = NULL,
    @subtotal DECIMAL(10,2) = NULL,
    @discount DECIMAL(10,2) = NULL,
    @shipping DECIMAL(10,2) = NULL,
    @total DECIMAL(10,2) = NULL,
    @quantity INT = NULL,
    @unit_price DECIMAL(10,2) = NULL,
    @full_name NVARCHAR(120) = NULL,
    @phone NVARCHAR(30) = NULL,
    @line1 NVARCHAR(190) = NULL,
    @line2 NVARCHAR(190) = NULL,
    @city NVARCHAR(120) = NULL,
    @state NVARCHAR(120) = NULL,
    @postal_code NVARCHAR(20) = NULL,
    @country NVARCHAR(120) = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF @Flag = 'C'
        BEGIN
            DECLARE @order_number NVARCHAR(40) = 'ORD' + REPLACE(REPLACE(CONVERT(NVARCHAR(20), GETUTCDATE(), 120), '-', ''), ''':'', '''') + LEFT(NEWID(), 6);
            INSERT INTO [dbo].[orders] (order_number, user_id, subtotal, discount, shipping, total, status, payment_status)
            VALUES (@order_number, @user_id, @subtotal, ISNULL(@discount, 0), ISNULL(@shipping, 0), @total, 'pending', 'unpaid');
            SELECT SCOPE_IDENTITY() AS id, @order_number AS order_number;
        END
        ELSE IF @Flag = 'R'
        BEGIN
            SELECT id, order_number, user_id, subtotal, discount, shipping, total, status, payment_status, created_at, updated_at
            FROM [dbo].[orders] WITH (NOLOCK)
            WHERE user_id = @user_id
            ORDER BY created_at DESC;
        END
        ELSE IF @Flag = 'I'
        BEGIN
            INSERT INTO [dbo].[order_items] (order_id, product_id, quantity, unit_price, line_total)
            VALUES (@order_id, @product_id, @quantity, @unit_price, @quantity * @unit_price);
        END
        ELSE IF @Flag = 'A'
        BEGIN
            INSERT INTO [dbo].[order_addresses] (order_id, full_name, phone, line1, line2, city, state, postal_code, country)
            VALUES (@order_id, @full_name, @phone, @line1, @line2, @city, @state, @postal_code, ISNULL(@country, 'Nepal'));
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT 'All stored procedures created successfully!';
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