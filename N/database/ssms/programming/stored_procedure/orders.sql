-- SSMS Orders stored procedure (flag-based)
-- Actions: C=Create, R=Read, I=Insert items, A=Insert address

CREATE PROCEDURE [dbo].[usp_Order]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @user_id BIGINT = NULL,
    @cart_id BIGINT = NULL,
    @subtotal DECIMAL(10,2) = NULL,
    @discount DECIMAL(10,2) = NULL,
    @shipping DECIMAL(10,2) = NULL,
    @total DECIMAL(10,2) = NULL,
    @order_id BIGINT = NULL,
    @product_id BIGINT = NULL,
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
        
        IF @Flag = 'C' -- Create order
        BEGIN
            DECLARE @order_number NVARCHAR(40) = 'ORD' + REPLACE(REPLACE(CONVERT(NVARCHAR(20), GETUTCDATE(), 120), '-', ''), '':'', '''') + LEFT(NEWID(), 6);
            
            INSERT INTO [dbo].[orders] (order_number, user_id, subtotal, discount, shipping, total, status, payment_status)
            VALUES (@order_number, @user_id, @subtotal, ISNULL(@discount, 0), ISNULL(@shipping, 0), @total, 'pending', 'unpaid');
            
            DECLARE @newId BIGINT = SCOPE_IDENTITY();
            
            SELECT @newId AS id, @order_number AS order_number;
        END
        ELSE IF @Flag = 'R' -- Read by user
        BEGIN
            SELECT 
                id,
                order_number,
                user_id,
                subtotal,
                discount,
                shipping,
                total,
                status,
                payment_status,
                created_at,
                updated_at
            FROM [dbo].[orders] WITH (NOLOCK)
            WHERE user_id = @user_id
            ORDER BY created_at DESC;
        END
        ELSE IF @Flag = 'I' -- Insert order item
        BEGIN
            INSERT INTO [dbo].[order_items] (order_id, product_id, quantity, unit_price, line_total)
            VALUES (@order_id, @product_id, @quantity, @unit_price, @quantity * @unit_price);
        END
        ELSE IF @Flag = 'A' -- Insert order address
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