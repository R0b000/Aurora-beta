-- SSMS Products stored procedure (flag-based)
-- Actions: C=Create, R=Read, U=Update, D=Delete

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
        
        IF @Flag = 'C' -- Create
        BEGIN
            INSERT INTO [dbo].[products] (seller_id, category_id, name, slug, description, price, discount_price, stock, sku, is_active)
            VALUES (@seller_id, @category_id, @name, @slug, @description, @price, @discount_price, ISNULL(@stock, 0), @sku, ISNULL(@is_active, 1));
            
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R' -- Read
        BEGIN
            SELECT 
                p.id,
                p.seller_id,
                p.category_id,
                p.name,
                p.slug,
                p.description,
                p.price,
                p.discount_price,
                p.stock,
                p.sku,
                p.is_active,
                p.created_at,
                p.updated_at
            FROM [dbo].[products] p WITH (NOLOCK)
            WHERE (@id IS NULL OR p.id = @id)
              AND (@seller_id IS NULL OR p.seller_id = @seller_id)
              AND (@slug IS NULL OR p.slug = @slug);
        END
        ELSE IF @Flag = 'U' -- Update
        BEGIN
            UPDATE [dbo].[products]
            SET 
                category_id = ISNULL(@category_id, category_id),
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
            
            SELECT @id AS id;
        END
        ELSE IF @Flag = 'D' -- Delete
        BEGIN
            DELETE FROM [dbo].[products] WHERE id = @id;
            SELECT @id AS id;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO