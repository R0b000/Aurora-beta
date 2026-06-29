-- SSMS Orders table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[orders] (
        id             BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_number   NVARCHAR(40) NOT NULL UNIQUE,
        user_id        BIGINT NOT NULL,
        subtotal       DECIMAL(10,2) NOT NULL,
        discount       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
        shipping       DECIMAL(10,2) NOT NULL DEFAULT 0.0,
        total          DECIMAL(10,2) NOT NULL,
        status         NVARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_status NVARCHAR(20) NOT NULL DEFAULT 'unpaid',
        created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_order_user FOREIGN KEY (user_id) REFERENCES [dbo].[users](id) ON DELETE RESTRICT
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[order_items] (
        id         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id   BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity   INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        line_total DECIMAL(10,2) NOT NULL,
        CONSTRAINT FK_oitem_order FOREIGN KEY (order_id) REFERENCES [dbo].[orders](id) ON DELETE CASCADE,
        CONSTRAINT FK_oitem_product FOREIGN KEY (product_id) REFERENCES [dbo].[products](id) ON DELETE RESTRICT
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_addresses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[order_addresses] (
        id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id    BIGINT NOT NULL,
        full_name   NVARCHAR(120) NOT NULL,
        phone       NVARCHAR(30) NOT NULL,
        line1       NVARCHAR(190) NOT NULL,
        line2       NVARCHAR(190) NULL,
        city        NVARCHAR(120) NOT NULL,
        state       NVARCHAR(120) NULL,
        postal_code NVARCHAR(20) NULL,
        country     NVARCHAR(120) NOT NULL DEFAULT 'Nepal',
        CONSTRAINT FK_oaddr_order FOREIGN KEY (order_id) REFERENCES [dbo].[orders](id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[transactions] (
        id             BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id       BIGINT NOT NULL,
        transaction_id NVARCHAR(120) NULL,
        status         NVARCHAR(40) NULL,
        total_amount   NVARCHAR(40) NULL,
        created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_txn_order FOREIGN KEY (order_id) REFERENCES [dbo].[orders](id) ON DELETE CASCADE
    );
END
GO