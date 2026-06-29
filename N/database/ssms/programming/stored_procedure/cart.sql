-- SSMS Cart stored procedure (flag-based)
-- Actions: C=Create, R=Read cart, I=Insert item, U=Update quantity, D=Delete item

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
        
        IF @Flag = 'C' -- Create cart
        BEGIN
            INSERT INTO [dbo].[cart] (user_id, is_active)
            VALUES (@user_id, 1);
            
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R' -- Read cart by user
        BEGIN
            SELECT TOP 1 *
            FROM [dbo].[cart] WITH (NOLOCK)
            WHERE user_id = @user_id AND is_active = 1;
        END
        ELSE IF @Flag = 'I' -- Insert cart item
        BEGIN
            -- Check if item exists
            IF EXISTS (SELECT 1 FROM [dbo].[cart_items] WITH (NOLOCK) WHERE cart_id = @cart_id AND product_id = @product_id)
            BEGIN
                UPDATE [dbo].[cart_items]
                SET quantity = quantity + @quantity
                WHERE cart_id = @cart_id AND product_id = @product_id;
            END
            ELSE
            BEGIN
                INSERT INTO [dbo].[cart_items] (cart_id, product_id, quantity, unit_price)
                VALUES (@cart_id, @product_id, @quantity, @unit_price);
            END
        END
        ELSE IF @Flag = 'U' -- Update quantity
        BEGIN
            UPDATE [dbo].[cart_items]
            SET quantity = @quantity
            WHERE id = @cart_id; -- Using cart_id as item id for simplicity
        END
        ELSE IF @Flag = 'D' -- Delete item
        BEGIN
            DELETE FROM [dbo].[cart_items] WHERE id = @cart_id; -- Using cart_id as item id
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO