-- SSMS Banner stored procedure (flag-based)
-- Actions: C=Create, R=Read, U=Update, D=Delete

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
        
        IF @Flag = 'C' -- Create
        BEGIN
            INSERT INTO [dbo].[banners] (title, image_url, link_url, is_active, sort_order)
            VALUES (@title, @image_url, @link_url, ISNULL(@is_active, 1), ISNULL(@sort_order, 0));
            
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R' -- Read (all active)
        BEGIN
            SELECT 
                id,
                title,
                image_url AS image_url,
                link_url AS link_url,
                position,
                is_active AS is_active,
                sort_order AS sort_order,
                created_at,
                updated_at
            FROM [dbo].[banners] WITH (NOLOCK)
            WHERE (is_active = 1 OR @id IS NOT NULL)
              AND (@id IS NULL OR id = @id)
            ORDER BY sort_order ASC, created_at DESC;
        END
        ELSE IF @Flag = 'U' -- Update
        BEGIN
            UPDATE [dbo].[banners]
            SET 
                title = ISNULL(@title, title),
                image_url = ISNULL(@image_url, image_url),
                link_url = ISNULL(@link_url, link_url),
                is_active = ISNULL(@is_active, is_active),
                sort_order = ISNULL(@sort_order, sort_order),
                updated_at = GETUTCDATE()
            WHERE id = @id;
            
            SELECT @id AS id;
        END
        ELSE IF @Flag = 'D' -- Delete
        BEGIN
            DELETE FROM [dbo].[banners] WHERE id = @id;
            SELECT @id AS id;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO