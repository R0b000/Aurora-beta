-- Migration: add public_id to banners procedure
-- Run this in SSMS against your live database

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_Banner]') AND type in (N'P'))
BEGIN
    ALTER PROCEDURE [dbo].[usp_Banner]
        @Flag CHAR(1) = 'R',
        @id BIGINT = NULL,
        @title NVARCHAR(190) = NULL,
        @image_url NVARCHAR(500) = NULL,
        @public_id NVARCHAR(500) = NULL,
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
                INSERT INTO [dbo].[banners] (title, image_url, public_id, link_url, is_active, sort_order)
                VALUES (@title, @image_url, @public_id, @link_url, ISNULL(@is_active, 1), ISNULL(@sort_order, 0));

                SELECT SCOPE_IDENTITY() AS id;
            END
            ELSE IF @Flag = 'R'
            BEGIN
                SELECT
                    id,
                    title,
                    image_url,
                    public_id,
                    link_url,
                    position,
                    is_active,
                    sort_order,
                    created_at,
                    updated_at
                FROM [dbo].[banners] WITH (NOLOCK)
                WHERE (is_active = 1 OR @id IS NOT NULL)
                  AND (@id IS NULL OR id = @id)
                ORDER BY sort_order ASC, created_at DESC;
            END
            ELSE IF @Flag = 'U'
            BEGIN
                UPDATE [dbo].[banners]
                SET
                    title = ISNULL(@title, title),
                    image_url = ISNULL(@image_url, image_url),
                    public_id = ISNULL(@public_id, public_id),
                    link_url = ISNULL(@link_url, link_url),
                    is_active = ISNULL(@is_active, is_active),
                    sort_order = ISNULL(@sort_order, sort_order),
                    updated_at = GETUTCDATE()
                WHERE id = @id;

                SELECT @id AS id;
            END
            ELSE IF @Flag = 'D'
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
    PRINT 'usp_Banner migrated successfully';
END
ELSE
BEGIN
    PRINT 'usp_Banner not found - check database';
END
GO
