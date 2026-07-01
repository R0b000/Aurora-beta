-- Migration: add public_id to categories
-- Run this in SSMS against your live database

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_Category]') AND type in (N'P'))
BEGIN
    ALTER PROCEDURE [dbo].[usp_Category]
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

            IF @Flag = 'C'
            BEGIN
                INSERT INTO [dbo].[categories] (name, slug, description, image_url, public_id, parent_id, is_active)
                VALUES (@name, @slug, @description, @image_url, @public_id, @parent_id, ISNULL(@is_active, 1));

                SELECT SCOPE_IDENTITY() AS id;
            END
            ELSE IF @Flag = 'R'
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
            ELSE IF @Flag = 'U'
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
            ELSE IF @Flag = 'D'
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
    PRINT 'usp_Category migrated successfully';
END
ELSE
BEGIN
    PRINT 'usp_Category not found - check database';
END
GO
