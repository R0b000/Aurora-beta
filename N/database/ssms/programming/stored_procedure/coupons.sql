-- SSMS Coupons stored procedure (flag-based)
-- Actions: C=Create, R=Read, U=Update, D=Delete

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
        
        IF @Flag = 'C' -- Create
        BEGIN
            INSERT INTO [dbo].[coupons] (code, type, value, is_active)
            VALUES (@code, @type, @value, ISNULL(@is_active, 1));
            
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R' -- Read
        BEGIN
            SELECT 
                id,
                code,
                type,
                value,
                is_active,
                created_at,
                updated_at
            FROM [dbo].[coupons] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@code IS NULL OR code = @code)
              AND (@is_active IS NULL OR is_active = @is_active);
        END
        ELSE IF @Flag = 'U' -- Update
        BEGIN
            UPDATE [dbo].[coupons]
            SET 
                code = ISNULL(@code, code),
                type = ISNULL(@type, type),
                value = ISNULL(@value, value),
                is_active = ISNULL(@is_active, is_active),
                updated_at = GETUTCDATE()
            WHERE id = @id;
            
            SELECT @id AS id;
        END
        ELSE IF @Flag = 'D' -- Delete
        BEGIN
            DELETE FROM [dbo].[coupons] WHERE id = @id;
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