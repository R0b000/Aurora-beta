-- SSMS Categories table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[categories] (
        id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name        NVARCHAR(120) NOT NULL,
        slug        NVARCHAR(140) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NULL,
        image_url   NVARCHAR(500) NULL,
        parent_id   BIGINT NULL,
        is_active   BIT NOT NULL DEFAULT 1,
        created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_category_parent FOREIGN KEY (parent_id) REFERENCES [dbo].[categories](id) ON DELETE SET NULL
    );
END
GO