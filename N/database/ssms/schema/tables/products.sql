-- SSMS Products table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[products] (
        id             BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        seller_id      BIGINT NOT NULL,
        category_id    BIGINT NULL,
        name           NVARCHAR(190) NOT NULL,
        slug           NVARCHAR(220) NOT NULL UNIQUE,
        description    NVARCHAR(MAX) NULL,
        price          DECIMAL(10,2) NOT NULL,
        discount_price DECIMAL(10,2) NULL,
        stock          INT NOT NULL DEFAULT 0,
        sku            NVARCHAR(80) NULL,
        is_active      BIT NOT NULL DEFAULT 1,
        created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_product_seller FOREIGN KEY (seller_id) REFERENCES [dbo].[users](id) ON DELETE CASCADE,
        CONSTRAINT FK_product_category FOREIGN KEY (category_id) REFERENCES [dbo].[categories](id) ON DELETE SET NULL
    );
END
GO