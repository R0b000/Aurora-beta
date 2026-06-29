-- SSMS Users stored procedure (flag-based)
-- Actions: C=Create, R=Read, U=Update, D=Delete, E=Exists

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
        
        IF @Flag = 'C' -- Create
        BEGIN
            INSERT INTO [dbo].[users] (name, email, password_hash, role, phone, is_verified, is_banned)
            VALUES (@name, @email, @password_hash, ISNULL(@role, 'customer'), @phone, 1, ISNULL(@is_banned, 0));
            
            SELECT 
                id,
                name,
                email,
                role,
                phone,
                avatar_url,
                is_verified,
                is_banned,
                created_at,
                updated_at
            FROM [dbo].[users]
            WHERE id = SCOPE_IDENTITY();
        END
        ELSE IF @Flag = 'R' -- Read
        BEGIN
            SELECT 
                id,
                name,
                email,
                password_hash,
                role,
                phone,
                avatar_url,
                is_verified,
                is_banned,
                created_at,
                updated_at
            FROM [dbo].[users] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@email IS NULL OR email = @email);
        END
        ELSE IF @Flag = 'U' -- Update
        BEGIN
            UPDATE [dbo].[users]
            SET 
                name = ISNULL(@name, name),
                phone = ISNULL(@phone, phone),
                is_banned = ISNULL(@is_banned, is_banned),
                updated_at = GETUTCDATE()
            WHERE id = @id;
        END
        ELSE IF @Flag = 'D' -- Delete
        BEGIN
            DELETE FROM [dbo].[users] WHERE id = @id;
        END
        ELSE IF @Flag = 'E' -- Exists check
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