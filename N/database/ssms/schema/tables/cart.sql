-- SSMS Cart table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cart]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cart] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id    BIGINT NOT NULL,
        is_active  BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_cart_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cart_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cart_items] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        cart_id    BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity   INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_cartitem_cart FOREIGN KEY (cart_id) REFERENCES [dbo].[cart](id) ON DELETE CASCADE,
        CONSTRAINT FK_cartitem_product FOREIGN KEY (product_id) REFERENCES [dbo].[products](id) ON DELETE CASCADE
    );
END
GO