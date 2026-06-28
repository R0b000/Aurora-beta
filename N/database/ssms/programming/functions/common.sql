-- SSMS Functions

-- Function to generate unique order number
CREATE FUNCTION [dbo].[generate_order_number]()
RETURNS NVARCHAR(40)
AS
BEGIN
    DECLARE @orderNumber NVARCHAR(40);
    DECLARE @timestamp NVARCHAR(20) = REPLACE(REPLACE(CONVERT(NVARCHAR(20), GETUTCDATE(), 120), '-', ''), ':', ''), ':'
    
    -- Check if order number exists and generate unique one
    WHILE 1=1
    BEGIN
        SET @orderNumber = 'ORD' + @timestamp + LEFT(NEWID(), 6);
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[orders] WHERE order_number = @orderNumber)
            BREAK;
    END
    
    RETURN @orderNumber;
END;
GO

-- Function to format date for JSON
CREATE FUNCTION [dbo].[format_datetime2_json](@dt DATETIME2)
RETURNS NVARCHAR(50)
AS
BEGIN
    RETURN CONVERT(NVARCHAR(50), @dt, 126);
END;
GO