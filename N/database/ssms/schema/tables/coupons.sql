-- SSMS Coupons table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[coupons]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[coupons] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        code       NVARCHAR(60) NOT NULL UNIQUE,
        type       NVARCHAR(20) NOT NULL,
        value      DECIMAL(10,2) NOT NULL,
        is_active  BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO