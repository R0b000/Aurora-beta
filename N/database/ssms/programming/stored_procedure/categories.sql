-- SSMS Categories stored procedure (flag-based)
-- Actions: C=Create, R=Read, U=Update, D=Delete

CREATE PROCEDURE [dbo].[usp_Category]
    @Flag CHAR(1) = 'R',
    @id BIGINT = NULL,
    @name NVARCHAR(120) = NULL,
    @slug NVARCHAR(140) = NULL,
    @description NVARCHAR(MAX) = NULL,
    @image_url NVARCHAR(500) = NULL,
    @public_id NVARCHAR(500) = NULL,
    @parent_id BIGINT = NULL,
    @is_active BIT = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF @Flag = 'C' -- Create
        BEGIN
            INSERT INTO [dbo].[categories] (name, slug, description, image_url, public_id, parent_id, is_active)
            VALUES (@name, @slug, @description, @image_url, @public_id, @parent_id, ISNULL(@is_active, 1));
            
            SELECT SCOPE_IDENTITY() AS id;
        END
        ELSE IF @Flag = 'R' -- Read
        BEGIN
            SELECT 
                id,
                name,
                slug,
                description,
                image_url,
                public_id,
                parent_id,
                is_active,
                created_at,
                updated_at
            FROM [dbo].[categories] WITH (NOLOCK)
            WHERE (@id IS NULL OR id = @id)
              AND (@slug IS NULL OR slug = @slug)
              AND (@is_active IS NULL OR is_active = @is_active);
        END
        ELSE IF @Flag = 'U' -- Update
        BEGIN
            UPDATE [dbo].[categories]
            SET 
                name = ISNULL(@name, name),
                slug = ISNULL(@slug, slug),
                description = ISNULL(@description, description),
                image_url = ISNULL(@image_url, image_url),
                public_id = ISNULL(@public_id, public_id),
                parent_id = ISNULL(@parent_id, parent_id),
                is_active = ISNULL(@is_active, is_active),
                updated_at = GETUTCDATE()
            WHERE id = @id;
            
            SELECT @id AS id;
        END
        ELSE IF @Flag = 'D' -- Delete
        BEGIN
            DELETE FROM [dbo].[categories] WHERE id = @id;
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