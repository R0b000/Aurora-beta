-- SSMS Banners table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[banners] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        title      NVARCHAR(190) NOT NULL,
        image_url  NVARCHAR(500) NOT NULL,
        public_id  NVARCHAR(500) NULL,
        link_url   NVARCHAR(500) NULL,
        position   NVARCHAR(60) NOT NULL DEFAULT 'home',
        is_active  BIT NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        start_at   DATETIME2 NULL,
        end_at     DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
ELSE IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[banners]') AND name = 'public_id')
BEGIN
    ALTER TABLE [dbo].[banners] ADD public_id NVARCHAR(500) NULL;
END
GO