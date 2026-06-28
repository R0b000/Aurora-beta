-- SSMS Sessions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sessions] (
        id                 BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id            BIGINT NOT NULL,
        refresh_token_hash NVARCHAR(255) NOT NULL,
        ip                 NVARCHAR(45) NULL,
        user_agent         NVARCHAR(500) NULL,
        expires_at         DATETIME2 NOT NULL,
        revoked_at         DATETIME2 NULL,
        created_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_sessions_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND name = N'idx_sessions_token')
BEGIN
    CREATE INDEX idx_sessions_token ON [dbo].[sessions](refresh_token_hash);
END
GO