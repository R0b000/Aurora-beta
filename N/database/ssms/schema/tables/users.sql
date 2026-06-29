-- SSMS Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        id           BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name         NVARCHAR(120) NOT NULL,
        email        NVARCHAR(190) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role         NVARCHAR(20) NOT NULL DEFAULT 'customer',
        phone        NVARCHAR(30) NULL,
        avatar_url   NVARCHAR(500) NULL,
        is_verified  BIT NOT NULL DEFAULT 0,
        is_banned    BIT NOT NULL DEFAULT 0,
        created_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO